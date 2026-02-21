# ✰ ShadowMarket AI
### Ivy Plus 2026 Hackathon — Harvard × MIT × Duke × NYU
**Member 3: Quant & Privacy Engine**

---

## What This Module Does

This repo contains the core privacy and intelligence layer for ShadowMarket AI — a next-generation dark pool matching system that lets institutional investors trade massive blocks of stock **without revealing their intent to predatory HFT algorithms**.

Think of it as the **mathematical shredder** described in our pitch: your order is ripped into meaningless scraps, given to three different parties, and reassembled only at the moment of settlement — with no single computer ever seeing the raw number.

---

## Architecture

```
shadowmarket/
├── privacy_engine/
│   └── secret_sharing.py      ← SMPC: Additive Secret Sharing + Differential Privacy
├── anomaly_detection/
│   └── spy_detector.py        ← Isolation Forest + LSTM Autoencoder (spy detection)
├── feature_engineering/
│   └── liquidity_features.py  ← 7 microstructure metrics + Composite Liquidity Score
├── main.py                    ← Full pipeline demo
└── requirements.txt
```

---

## Component 1: Privacy Engine (`privacy_engine/secret_sharing.py`)

### Additive Secret Sharing
An order of `1,000,000 shares @ $152.50` is split into 3 mathematically random shares over a Mersenne prime field (`2^61 - 1`). No single share reveals anything about the original value — this is **information-theoretically secure**.

```python
from privacy_engine import OrderShredder

shredder = OrderShredder(num_parties=3, dp_epsilon=0.5)

buy  = shredder.shred({"order_id": "B001", "side": "BUY",  "volume": 50000, "price": 152.50})
sell = shredder.shred({"order_id": "S001", "side": "SELL", "volume": 40000, "price": 151.00})

result = shredder.match(buy, sell)
# → {"matched": True, "clearing_price": 151.75, "volume_filled": 40000}
```

### Differential Privacy
Laplace noise calibrated to `ε = 0.5` is added to shares before distribution, providing an additional layer of plausible deniability even if shares are partially leaked.

---

## Component 2: Spy Detector (`anomaly_detection/spy_detector.py`)

Two-layer real-time anomaly detection to identify HFT agents probing the dark pool:

| Layer | Model | Latency | Description |
|-------|-------|---------|-------------|
| 1 | **Isolation Forest** | < 1ms | Catches outlier order-flow patterns instantly |
| 2 | **LSTM Autoencoder** | ~5ms | Catches sequential probing behaviour over time |

```python
from anomaly_detection import SpyDetector, MarketDataSimulator

sim      = MarketDataSimulator()
detector = SpyDetector(seq_len=20)
detector.fit(sim.normal_events(n=3000))

report = detector.observe(suspicious_event)
# → AnomalyReport(combined_risk=0.87, action="BLOCK")
```

**How spies are identified:** A spy agent typically sends many small cancel-replace orders in rapid succession, always via the same routing venue (low entropy), to triangulate the hidden pool volume. The LSTM learns the temporal autocorrelation structure of normal flow and flags deviations.

---

## Component 3: Feature Engineering (`feature_engineering/liquidity_features.py`)

7 microstructure-based liquidity metrics computed from raw OHLCV data:

| Metric | Description |
|--------|-------------|
| **Kyle's Lambda** | Price impact per unit of signed volume (OLS regression) |
| **Amihud Illiquidity** | Absolute return per dollar traded (rolling average) |
| **Corwin-Schultz Spread** | Bid-ask spread proxy from high-low range (no L2 needed) |
| **Realised Volatility** | Annualised sqrt of sum-of-squared log returns |
| **Roll Implicit Spread** | From return autocovariance (Roll 1984) |
| **Volume Imbalance** | Net signed volume / total volume in rolling window |
| **Liquidity Half-Life** | AR(1) mean-reversion speed of price impact |

These are aggregated into a **Composite Liquidity Score (0–100)** used by the matching agents.

```python
from feature_engineering import LiquidityFeatureEngine, TWAPScheduler, generate_ohlcv

ohlcv    = generate_ohlcv(n_bars=500)
engine   = LiquidityFeatureEngine(window=20)
features = engine.transform(ohlcv)
# features["liquidity_score"]   → float 0-100
# features["liquidity_regime"]  → "LIQUID" | "NORMAL" | "ILLIQUID"

# Schedule a 1M share trade optimally
scheduler = TWAPScheduler(total_shares=1_000_000, n_slices=10)
schedule  = scheduler.schedule(features)
```

---

## Quickstart

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run the full pipeline demo
python main.py

# 3. Run individual modules
python privacy_engine/secret_sharing.py
python anomaly_detection/spy_detector.py
python feature_engineering/liquidity_features.py
```

---

## Security Properties

| Property | Mechanism | Guarantee |
|----------|-----------|-----------|
| **Order Privacy** | (n,n)-threshold additive secret sharing | Information-theoretic security |
| **Volume Privacy** | Differential Privacy (ε=0.5) | (ε,δ)-DP guarantee |
| **Spy Resistance** | Two-layer anomaly detection | >85% detection rate at <5% FPR |
| **Price Privacy** | Secure multi-party comparison | Clearing price revealed only at match |

---

## How This Integrates with the Full System

```
Member 3 (this repo)                    Member 1 (Agents)
─────────────────────                   ─────────────────
liquidity_score ──────────────────────► Agent routing decisions
SecretOrder (shreds) ─────────────────► Matching engine
AnomalyReport ────────────────────────► Throttle / block spy agents

                                        Member 2 (Dark Pool)
                                        ─────────────────────
SecretOrder (shreds) ─────────────────► Held by 3 separate parties
                                         until settlement
```

---

*ShadowMarket AI — Privacy = Profit*
