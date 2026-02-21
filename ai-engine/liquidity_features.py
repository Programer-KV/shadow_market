"""
ShadowMarket AI — Feature Engineering & Liquidity Scores
==========================================================
Processes raw OHLCV price data into rich "Liquidity Scores" that the
Multi-Agent matching engine uses to decide WHERE and WHEN to route orders.

A Liquidity Score answers: "How easy is it to trade X shares of stock Y
right now, without moving the price against ourselves?"

Features computed:
  1. Kyle's Lambda          — price impact per unit volume
  2. Amihud Illiquidity     — price change per dollar traded
  3. Bid-Ask Spread Proxy   — estimated from high-low-close (no L2 needed)
  4. Volume Imbalance Index — buy vs. sell pressure
  5. Realised Volatility    — rolling std of log returns
  6. Roll Implicit Spread   — from autocovariance of returns
  7. Liquidity Half-Life    — how fast order impact decays (mean-reversion)
  8. Composite Liquidity Score (0-100, 100 = most liquid)
"""

from __future__ import annotations
import numpy as np
import pandas as pd
from scipy.stats import linregress
from sklearn.preprocessing import MinMaxScaler
from dataclasses import dataclass
from typing import Optional
import warnings
warnings.filterwarnings("ignore")


# ─────────────────────────────────────────────
#  SYNTHETIC OHLCV GENERATOR
# ─────────────────────────────────────────────
def generate_ohlcv(
    n_bars: int = 1000,
    ticker: str = "AAPL",
    start_price: float = 150.0,
    volatility: float = 0.015,
    seed: int = 42,
) -> pd.DataFrame:
    """
    Generates realistic intraday OHLCV data with:
      - Geometric Brownian Motion mid-price
      - Volume correlated with volatility (more volume on big moves)
      - Realistic spread widening during illiquid periods
    """
    rng = np.random.default_rng(seed)
    minutes = pd.date_range("2025-01-02 09:30", periods=n_bars, freq="1min")

    # Mid-price via GBM
    returns = rng.normal(0, volatility / np.sqrt(390), n_bars)
    prices  = start_price * np.exp(np.cumsum(returns))

    # OHLC around mid
    spread = rng.uniform(0.01, 0.05, n_bars) * prices * 0.002
    opens  = prices * np.exp(rng.normal(0, 0.001, n_bars))
    highs  = np.maximum(prices, opens) + rng.exponential(spread)
    lows   = np.minimum(prices, opens) - rng.exponential(spread)
    closes = prices + rng.normal(0, spread * 0.3)

    # Volume: higher on big moves (informed trading proxy)
    base_vol = rng.lognormal(mean=12, sigma=0.5, size=n_bars)   # ~160k shares/min
    vol_mult = 1 + 3 * np.abs(returns) / volatility
    volumes  = (base_vol * vol_mult).astype(int)

    df = pd.DataFrame({
        "timestamp": minutes,
        "open":      opens,
        "high":      highs,
        "low":       lows,
        "close":     closes,
        "volume":    volumes,
        "ticker":    ticker,
    })
    df = df.set_index("timestamp")
    return df


# ─────────────────────────────────────────────
#  FEATURE ENGINEERING PIPELINE
# ─────────────────────────────────────────────
class LiquidityFeatureEngine:
    """
    Transforms raw OHLCV bars into a feature matrix suitable for the
    Multi-Agent matching system.

    Each row in the output represents one bar and contains:
      - All raw OHLCV columns
      - 7 microstructure liquidity metrics
      - 1 composite liquidity score (0-100)
    """

    def __init__(self, window: int = 20, impact_window: int = 5):
        self.window        = window      # rolling window for stats
        self.impact_window = impact_window  # bars to measure price impact
        self.scaler        = MinMaxScaler()

    # ── Individual Feature Calculations ────────────────────────────────

    def _log_returns(self, df: pd.DataFrame) -> pd.Series:
        return np.log(df["close"] / df["close"].shift(1))

    def _amihud_illiquidity(self, df: pd.DataFrame, log_ret: pd.Series) -> pd.Series:
        """
        Amihud (2002): illiquidity = |return| / dollar_volume
        High value → price moves a lot per dollar traded → illiquid
        """
        dollar_vol = df["close"] * df["volume"]
        amihud = log_ret.abs() / dollar_vol.replace(0, np.nan)
        return amihud.rolling(self.window).mean() * 1e9   # scale for readability

    def _kyle_lambda(self, df: pd.DataFrame, log_ret: pd.Series) -> pd.Series:
        """
        Kyle's lambda: price impact coefficient from OLS regression of
        |return| on signed sqrt(volume). Rolling window version.
        """
        signed_vol = np.sign(log_ret) * np.sqrt(df["volume"])
        lambdas = []
        for i in range(len(df)):
            if i < self.window:
                lambdas.append(np.nan)
                continue
            y = log_ret.iloc[i - self.window: i].values
            x = signed_vol.iloc[i - self.window: i].values
            mask = np.isfinite(x) & np.isfinite(y)
            if mask.sum() < 5:
                lambdas.append(np.nan)
                continue
            slope, *_ = linregress(x[mask], y[mask])
            lambdas.append(abs(slope))
        return pd.Series(lambdas, index=df.index, name="kyle_lambda")

    def _corwin_schultz_spread(self, df: pd.DataFrame) -> pd.Series:
        """
        Corwin & Schultz (2012) high-low spread estimator.
        Requires only OHLC — no Level 2 data needed.
        Works well for dark pool context where L2 is hidden.
        """
        beta = (np.log(df["high"] / df["low"]) ** 2 +
                np.log(df["high"].shift(1) / df["low"].shift(1)) ** 2)
        gamma = np.log(
            df[["high", "high"]].shift(1).max(axis=1) /
            df[["low",  "low"]].shift(1).min(axis=1)
        ) ** 2
        alpha = (np.sqrt(2 * beta) - np.sqrt(beta)) / (3 - 2 * np.sqrt(2)) \
                - np.sqrt(gamma / (3 - 2 * np.sqrt(2)))
        spread = 2 * (np.exp(alpha) - 1) / (1 + np.exp(alpha))
        spread = spread.clip(lower=0)   # spread can't be negative
        return spread.rolling(self.window).mean()

    def _realised_volatility(self, log_ret: pd.Series) -> pd.Series:
        """Annualised realised volatility (sqrt of sum of squared returns)."""
        rv = np.sqrt((log_ret ** 2).rolling(self.window).sum()) * np.sqrt(252 * 390)
        return rv

    def _roll_spread(self, log_ret: pd.Series) -> pd.Series:
        """
        Roll (1984) implicit bid-ask spread from return autocovariance.
        spread = 2 * sqrt(max(0, -Cov(r_t, r_{t-1})))
        """
        cov = log_ret.rolling(self.window).cov(log_ret.shift(1))
        roll = 2 * np.sqrt((-cov).clip(lower=0))
        return roll

    def _volume_imbalance(self, df: pd.DataFrame, log_ret: pd.Series) -> pd.Series:
        """
        Proxy buy/sell imbalance using return sign × volume.
        Positive = net buying pressure, negative = net selling.
        """
        signed_vol = np.sign(log_ret) * df["volume"]
        total_vol  = df["volume"].rolling(self.window).sum()
        net_vol    = signed_vol.rolling(self.window).sum()
        imbalance  = net_vol / total_vol.replace(0, np.nan)
        return imbalance

    def _liquidity_half_life(self, df: pd.DataFrame, log_ret: pd.Series) -> pd.Series:
        """
        Estimate mean-reversion speed of price impact using AR(1) on returns.
        half_life = -log(2) / log(|AR1 coefficient|)
        Short half-life → fast impact decay → more liquid.
        """
        half_lives = []
        for i in range(len(df)):
            if i < self.window:
                half_lives.append(np.nan)
                continue
            y = log_ret.iloc[i - self.window + 1: i + 1].values
            x = log_ret.iloc[i - self.window:     i    ].values
            mask = np.isfinite(x) & np.isfinite(y)
            if mask.sum() < 5:
                half_lives.append(np.nan)
                continue
            slope, *_ = linregress(x[mask], y[mask])
            slope = np.clip(slope, -0.999, -0.001)    # must be mean-reverting
            hl = -np.log(2) / np.log(abs(slope))
            half_lives.append(hl)
        return pd.Series(half_lives, index=df.index, name="liquidity_half_life")

    # ── Composite Score ──────────────────────────────────────────────────
    def _composite_liquidity_score(self, features: pd.DataFrame) -> pd.Series:
        """
        Combine individual metrics into a single 0-100 score.

        Higher = more liquid.  We invert illiquidity metrics before scoring.
        Weights chosen to match empirical literature on microstructure.
        """
        # Invert "bad" metrics (high value = illiquid)
        illiq_cols = ["amihud_illiquidity", "kyle_lambda",
                      "cs_spread", "roll_spread", "realised_vol"]
        liq_cols   = ["liquidity_half_life"]   # lower half-life = more liquid (also invert)

        df = features[illiq_cols + liq_cols + ["volume_imbalance"]].copy()

        # Winsorise extreme values
        for col in df.columns:
            lo, hi = df[col].quantile(0.01), df[col].quantile(0.99)
            df[col] = df[col].clip(lo, hi)

        # Flip: high score = good
        for col in illiq_cols + liq_cols:
            df[col] = df[col].max() - df[col]

        # Volume imbalance: penalise extremes (very high imbalance = thin book)
        df["volume_imbalance"] = 1 - df["volume_imbalance"].abs()

        # Normalise each column to [0,1]
        for col in df.columns:
            rng = df[col].max() - df[col].min()
            df[col] = (df[col] - df[col].min()) / (rng if rng > 0 else 1)

        # Weighted sum
        weights = {
            "amihud_illiquidity": 0.25,
            "kyle_lambda":        0.20,
            "cs_spread":          0.15,
            "roll_spread":        0.10,
            "realised_vol":       0.10,
            "liquidity_half_life":0.10,
            "volume_imbalance":   0.10,
        }
        score = sum(df[col] * w for col, w in weights.items())
        return (score * 100).round(2)

    # ── Main Pipeline ────────────────────────────────────────────────────
    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Input:  OHLCV DataFrame with DatetimeIndex
        Output: DataFrame with all original columns + liquidity features
        """
        out = df.copy()
        log_ret = self._log_returns(df)

        print("[FeatureEng] Computing microstructure features…")
        out["log_return"]          = log_ret
        out["amihud_illiquidity"]  = self._amihud_illiquidity(df, log_ret)
        out["kyle_lambda"]         = self._kyle_lambda(df, log_ret)
        out["cs_spread"]           = self._corwin_schultz_spread(df)
        out["realised_vol"]        = self._realised_volatility(log_ret)
        out["roll_spread"]         = self._roll_spread(log_ret)
        out["volume_imbalance"]    = self._volume_imbalance(df, log_ret)
        out["liquidity_half_life"] = self._liquidity_half_life(df, log_ret)
        out["liquidity_score"]     = self._composite_liquidity_score(out)

        # Regime label for agent context
        out["liquidity_regime"] = pd.cut(
            out["liquidity_score"],
            bins=[0, 33, 66, 100],
            labels=["ILLIQUID", "NORMAL", "LIQUID"],
            include_lowest=True,
        )

        print(f"[FeatureEng] Done. Output shape: {out.shape}")
        return out.dropna(subset=["liquidity_score"])

    def fit_transform(self, df: pd.DataFrame) -> pd.DataFrame:
        return self.transform(df)


# ─────────────────────────────────────────────
#  OPTIMAL EXECUTION SCHEDULER
# ─────────────────────────────────────────────
class TWAPScheduler:
    """
    Time-Weighted Average Price scheduler that uses liquidity scores
    to schedule execution slices — pushing more volume into high-liquidity bars.

    This is what the matching agents actually consume from Member 3's engine.
    """

    def __init__(self, total_shares: int, n_slices: int = 10):
        self.total_shares = total_shares
        self.n_slices     = n_slices

    def schedule(self, features: pd.DataFrame) -> pd.DataFrame:
        """
        Given a feature frame (with liquidity_score), return a schedule
        of when to execute how many shares.
        """
        tail = features.tail(self.n_slices).copy()
        scores = tail["liquidity_score"].values

        # Weight each slice by its liquidity score
        weights = scores / scores.sum()
        tail["scheduled_shares"] = (weights * self.total_shares).round().astype(int)

        # Fix rounding so total matches exactly
        diff = self.total_shares - tail["scheduled_shares"].sum()
        tail.iloc[tail["liquidity_score"].argmax(),
                  tail.columns.get_loc("scheduled_shares")] += int(diff)

        tail["participation_rate"] = (
            tail["scheduled_shares"] / tail["volume"]
        ).round(4)

        return tail[["liquidity_score", "liquidity_regime",
                     "scheduled_shares", "participation_rate"]]


# ─────────────────────────────────────────────
#  DEMO
# ─────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 60)
    print("  ShadowMarket AI — Feature Engineering Demo")
    print("=" * 60)

    # Generate synthetic OHLCV data
    ohlcv = generate_ohlcv(n_bars=500, ticker="AAPL", seed=42)
    print(f"\n[Data] Generated {len(ohlcv)} bars for AAPL")
    print(ohlcv.tail(3).to_string())

    # Compute liquidity features
    engine = LiquidityFeatureEngine(window=20)
    features = engine.transform(ohlcv)

    print("\n── Liquidity Feature Summary ──────────────────────────────")
    feature_cols = [
        "amihud_illiquidity", "kyle_lambda", "cs_spread",
        "realised_vol", "roll_spread", "volume_imbalance",
        "liquidity_half_life", "liquidity_score"
    ]
    print(features[feature_cols].describe().round(4).to_string())

    print("\n── Recent Liquidity Scores ────────────────────────────────")
    print(features[["close", "volume", "liquidity_score", "liquidity_regime"]].tail(10).to_string())

    # TWAP schedule
    print("\n── Optimal Execution Schedule (1,000,000 shares) ──────────")
    scheduler = TWAPScheduler(total_shares=1_000_000, n_slices=10)
    schedule  = scheduler.schedule(features)
    print(schedule.to_string())
    print(f"\n  Total scheduled: {schedule['scheduled_shares'].sum():,} shares")
    print()
