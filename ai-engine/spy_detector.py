"""
ShadowMarket AI — Spy Detector
================================
Two-layer defence against Predatory HFT / adversarial agents trying to
"sniff" the dark pool's hidden volume.

Layer 1 — Isolation Forest (fast, unsupervised, no labels needed)
  Detects outlier behaviour in real-time order-flow statistics.
  Fires within milliseconds — good for live trading.

Layer 2 — LSTM Sequence Anomaly Detector (PyTorch)
  Learns the normal temporal pattern of order arrival.
  A "spy" agent's probing pattern breaks the sequence → high reconstruction loss.

Output: AnomalyReport with risk score 0-1 and a recommended action.
"""

from __future__ import annotations
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from dataclasses import dataclass
from typing import List, Optional
import warnings
warnings.filterwarnings("ignore")


# ─────────────────────────────────────────────
#  DATA STRUCTURES
# ─────────────────────────────────────────────
@dataclass
class OrderEvent:
    """
    A single observed order-flow event in the dark pool.
    These are the features we can observe WITHOUT seeing the actual order value.
    """
    timestamp_ms:   int
    inter_arrival:  float   # ms since last order
    order_rate_1s:  float   # orders per second (last 1 s window)
    cancel_ratio:   float   # cancels / total in last 10 s
    size_bucket:    int     # coarse bucket: 1=small, 2=mid, 3=large (after DP)
    venue_entropy:  float   # Shannon entropy of venue routing — low = suspicious
    side_imbalance: float   # (buys - sells) / (buys + sells) in last 5 s


@dataclass
class AnomalyReport:
    timestamp_ms:     int
    iso_forest_score: float   # raw isolation score (-1 to 0; closer to -1 = outlier)
    lstm_recon_loss:  float
    combined_risk:    float   # 0-1  (1 = definitely a spy)
    is_anomalous:     bool
    action:           str     # "ALLOW" | "THROTTLE" | "BLOCK"


# ─────────────────────────────────────────────
#  LAYER 1 — ISOLATION FOREST
# ─────────────────────────────────────────────
class SpyIsolationForest:
    """
    Trained on normal market microstructure data.
    Flags agents whose order patterns are statistically rare.

    Key intuition: a spy probing the dark pool will send many small
    orders in rapid succession to triangulate the hidden volume. This
    shows up as low inter_arrival, high order_rate, low venue_entropy.
    """

    FEATURE_COLS = [
        "inter_arrival", "order_rate_1s", "cancel_ratio",
        "size_bucket", "venue_entropy", "side_imbalance"
    ]

    def __init__(self, contamination: float = 0.05, n_estimators: int = 200):
        self.model = IsolationForest(
            n_estimators=n_estimators,
            contamination=contamination,
            random_state=42,
            n_jobs=-1,
        )
        self.scaler = StandardScaler()
        self.is_fitted = False

    def _to_array(self, events: List[OrderEvent]) -> np.ndarray:
        rows = [[
            e.inter_arrival, e.order_rate_1s, e.cancel_ratio,
            e.size_bucket,   e.venue_entropy,  e.side_imbalance
        ] for e in events]
        return np.array(rows, dtype=np.float32)

    def fit(self, events: List[OrderEvent]) -> "SpyIsolationForest":
        X = self._to_array(events)
        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled)
        self.is_fitted = True
        print(f"[IsoForest] Trained on {len(events):,} events.")
        return self

    def score(self, event: OrderEvent) -> float:
        """Return anomaly score: closer to -1 means more anomalous."""
        assert self.is_fitted, "Call .fit() first."
        X = self._to_array([event])
        X_scaled = self.scaler.transform(X)
        raw = self.model.score_samples(X_scaled)[0]
        # Normalise to [0, 1] risk  (score_samples returns negative values)
        return float(np.clip(1 + raw / 0.5, 0, 1))   # rough normalisation


# ─────────────────────────────────────────────
#  LAYER 2 — LSTM AUTOENCODER
# ─────────────────────────────────────────────
class LSTMAutoencoder(nn.Module):
    """
    Sequence autoencoder: encodes a window of order-flow events into a
    compressed latent vector, then decodes back.
    High reconstruction loss → the sequence doesn't match learned normal behaviour.
    """

    def __init__(self, input_dim: int = 6, hidden_dim: int = 32, latent_dim: int = 8, num_layers: int = 2):
        super().__init__()
        self.encoder = nn.LSTM(input_dim,  hidden_dim, num_layers, batch_first=True, dropout=0.2)
        self.enc_fc  = nn.Linear(hidden_dim, latent_dim)
        self.dec_fc  = nn.Linear(latent_dim, hidden_dim)
        self.decoder = nn.LSTM(hidden_dim, hidden_dim, num_layers, batch_first=True, dropout=0.2)
        self.output  = nn.Linear(hidden_dim, input_dim)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: (batch, seq_len, input_dim)
        enc_out, (h, _) = self.encoder(x)
        latent = self.enc_fc(h[-1])                          # (batch, latent_dim)
        dec_input = self.dec_fc(latent).unsqueeze(1).repeat(1, x.size(1), 1)
        dec_out, _ = self.decoder(dec_input)
        return self.output(dec_out)                          # (batch, seq_len, input_dim)


class LSTMSpyDetector:
    """Wraps LSTMAutoencoder with training + inference logic."""

    def __init__(self,
                 seq_len:    int   = 20,
                 input_dim:  int   = 6,
                 hidden_dim: int   = 32,
                 latent_dim: int   = 8,
                 threshold:  Optional[float] = None,
                 device:     str   = "cpu"):
        self.seq_len   = seq_len
        self.threshold = threshold
        self.device    = torch.device(device)
        self.scaler    = StandardScaler()
        self.model     = LSTMAutoencoder(input_dim, hidden_dim, latent_dim).to(self.device)
        self.is_fitted = False

    # ── helpers ─────────────────────────────────────────────────────────
    def _events_to_tensor(self, events: List[OrderEvent]) -> torch.Tensor:
        arr = np.array([[
            e.inter_arrival, e.order_rate_1s, e.cancel_ratio,
            e.size_bucket,   e.venue_entropy,  e.side_imbalance
        ] for e in events], dtype=np.float32)
        return arr

    def _make_sequences(self, X: np.ndarray) -> np.ndarray:
        seqs = []
        for i in range(len(X) - self.seq_len + 1):
            seqs.append(X[i: i + self.seq_len])
        return np.array(seqs)

    # ── train ─────────────────────────────────────────────────────────
    def fit(self, events: List[OrderEvent], epochs: int = 30, lr: float = 1e-3,
            batch_size: int = 64) -> "LSTMSpyDetector":

        X = self._events_to_tensor(events)
        X_scaled = self.scaler.fit_transform(X)
        seqs = self._make_sequences(X_scaled)                   # (N, seq, feat)

        dataset = torch.tensor(seqs, dtype=torch.float32)
        loader  = torch.utils.data.DataLoader(dataset, batch_size=batch_size, shuffle=True)

        optimiser = torch.optim.Adam(self.model.parameters(), lr=lr, weight_decay=1e-5)
        criterion = nn.MSELoss()
        self.model.train()

        print(f"[LSTM] Training on {len(seqs):,} sequences for {epochs} epochs…")
        for epoch in range(1, epochs + 1):
            total_loss = 0.0
            for batch in loader:
                batch = batch.to(self.device)
                recon = self.model(batch)
                loss  = criterion(recon, batch)
                optimiser.zero_grad()
                loss.backward()
                torch.nn.utils.clip_grad_norm_(self.model.parameters(), 1.0)
                optimiser.step()
                total_loss += loss.item()
            if epoch % 10 == 0 or epoch == 1:
                print(f"  Epoch {epoch:3d}/{epochs}  loss={total_loss/len(loader):.6f}")

        # Set threshold = 95th percentile of training reconstruction errors
        self.model.eval()
        with torch.no_grad():
            recon = self.model(dataset.to(self.device))
            losses = ((recon - dataset.to(self.device)) ** 2).mean(dim=(1, 2)).cpu().numpy()
        self.threshold = float(np.percentile(losses, 95))
        print(f"[LSTM] Anomaly threshold set to {self.threshold:.6f}")
        self.is_fitted = True
        return self

    # ── inference ─────────────────────────────────────────────────────
    def score(self, window: List[OrderEvent]) -> float:
        """
        Score a sliding window of seq_len events.
        Returns reconstruction loss (higher = more suspicious).
        """
        assert self.is_fitted
        assert len(window) == self.seq_len, \
            f"Need exactly {self.seq_len} events; got {len(window)}."

        X = self._events_to_tensor(window)
        X_scaled = self.scaler.transform(X)
        tensor = torch.tensor(X_scaled[np.newaxis], dtype=torch.float32).to(self.device)

        self.model.eval()
        with torch.no_grad():
            recon = self.model(tensor)
            loss  = ((recon - tensor) ** 2).mean().item()
        return loss

    def is_anomaly(self, loss: float) -> bool:
        return loss > self.threshold


# ─────────────────────────────────────────────
#  COMBINED DETECTOR
# ─────────────────────────────────────────────
class SpyDetector:
    """
    Orchestrates both detectors and emits an AnomalyReport.
    Architecture:
      - IsoForest runs on EVERY single event (zero latency).
      - LSTM runs on every rolling window of seq_len events.
      - Combined risk = weighted average.
    If combined_risk > 0.7 → BLOCK the agent's access to the dark pool.
    """

    ISO_WEIGHT  = 0.40
    LSTM_WEIGHT = 0.60

    def __init__(self, seq_len: int = 20, device: str = "cpu"):
        self.iso   = SpyIsolationForest()
        self.lstm  = LSTMSpyDetector(seq_len=seq_len, device=device)
        self.seq_len = seq_len
        self._buffer: List[OrderEvent] = []

    def fit(self, events: List[OrderEvent], lstm_epochs: int = 30):
        print("\n── Training Isolation Forest ──────────────────────────")
        self.iso.fit(events)
        print("\n── Training LSTM Autoencoder ──────────────────────────")
        self.lstm.fit(events, epochs=lstm_epochs)
        print("\n✓ SpyDetector fully trained.\n")

    def observe(self, event: OrderEvent) -> AnomalyReport:
        """Call this on every incoming order event in real time."""
        iso_risk = self.iso.score(event)

        self._buffer.append(event)
        if len(self._buffer) > self.seq_len:
            self._buffer.pop(0)

        lstm_loss = 0.0
        lstm_risk = 0.0
        if len(self._buffer) == self.seq_len:
            lstm_loss = self.lstm.score(self._buffer)
            # Normalise LSTM loss to [0,1] against threshold
            lstm_risk = float(np.clip(lstm_loss / (self.lstm.threshold * 2), 0, 1))

        combined = self.ISO_WEIGHT * iso_risk + self.LSTM_WEIGHT * lstm_risk

        is_anom = combined > 0.55
        if combined > 0.75:
            action = "BLOCK"
        elif combined > 0.55:
            action = "THROTTLE"
        else:
            action = "ALLOW"

        return AnomalyReport(
            timestamp_ms     = event.timestamp_ms,
            iso_forest_score = iso_risk,
            lstm_recon_loss  = lstm_loss,
            combined_risk    = combined,
            is_anomalous     = is_anom,
            action           = action,
        )

    def save(self, path: str = "spy_detector.pt"):
        import joblib, os
        os.makedirs(path, exist_ok=True)
        joblib.dump(self.iso, f"{path}/isolation_forest.pkl")
        joblib.dump(self.lstm.scaler, f"{path}/lstm_scaler.pkl")
        torch.save(self.lstm.model.state_dict(), f"{path}/lstm_model.pt")
        print(f"[SpyDetector] Saved to {path}/")

    def load(self, path: str = "spy_detector.pt"):
        import joblib
        self.iso = joblib.load(f"{path}/isolation_forest.pkl")
        self.iso.is_fitted = True
        self.lstm.scaler = joblib.load(f"{path}/lstm_scaler.pkl")
        self.lstm.model.load_state_dict(torch.load(f"{path}/lstm_model.pt", map_location="cpu"))
        self.lstm.is_fitted = True
        print(f"[SpyDetector] Loaded from {path}/")


# ─────────────────────────────────────────────
#  SYNTHETIC DATA GENERATOR
# ─────────────────────────────────────────────
class MarketDataSimulator:
    """
    Generates realistic order-flow data with embedded spy-agent episodes.
    Used for training and evaluation without needing real market data.
    """

    @staticmethod
    def normal_events(n: int = 5000, seed: int = 42) -> List[OrderEvent]:
        rng = np.random.default_rng(seed)
        events = []
        t = 0
        for _ in range(n):
            ia = rng.exponential(scale=250)   # Poisson arrivals ~4 orders/sec
            t += int(ia)
            events.append(OrderEvent(
                timestamp_ms   = t,
                inter_arrival  = ia,
                order_rate_1s  = rng.uniform(1, 8),
                cancel_ratio   = rng.beta(2, 10),       # mostly low
                size_bucket    = rng.choice([1, 2, 3], p=[0.5, 0.35, 0.15]),
                venue_entropy  = rng.uniform(1.5, 2.5), # high entropy = normal
                side_imbalance = rng.uniform(-0.3, 0.3),
            ))
        return events

    @staticmethod
    def spy_events(n: int = 200, seed: int = 99) -> List[OrderEvent]:
        """Spy agent: rapid small probes, low entropy (always same venue)."""
        rng = np.random.default_rng(seed)
        events = []
        t = 10_000_000   # start later
        for _ in range(n):
            ia = rng.exponential(scale=30)    # 30x faster than normal
            t += int(ia)
            events.append(OrderEvent(
                timestamp_ms   = t,
                inter_arrival  = ia,
                order_rate_1s  = rng.uniform(20, 50),   # very high rate
                cancel_ratio   = rng.beta(8, 2),        # mostly cancels (probing)
                size_bucket    = 1,                     # always small (stealth)
                venue_entropy  = rng.uniform(0.1, 0.5), # always same venue
                side_imbalance = rng.uniform(-0.05, 0.05),
            ))
        return events


# ─────────────────────────────────────────────
#  DEMO
# ─────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 60)
    print("  ShadowMarket AI — Spy Detector Demo")
    print("=" * 60)

    sim     = MarketDataSimulator()
    normal  = sim.normal_events(n=3000)
    spies   = sim.spy_events(n=200)

    # Train on normal data only
    detector = SpyDetector(seq_len=20)
    detector.fit(normal, lstm_epochs=20)

    # Evaluate on a mixed stream
    test_normal = sim.normal_events(n=100, seed=7)
    test_spies  = sim.spy_events(n=50,  seed=13)

    print("\n── Normal events ─────────────────────────────────────────")
    blocked = sum(
        1 for e in test_normal
        if detector.observe(e).action == "BLOCK"
    )
    print(f"  False positive rate: {blocked}/{len(test_normal)} ({100*blocked/len(test_normal):.1f}%)")

    # Reset buffer, test spy
    detector._buffer.clear()
    print("\n── Spy events ────────────────────────────────────────────")
    caught = 0
    for e in test_spies:
        report = detector.observe(e)
        if report.action in ("BLOCK", "THROTTLE"):
            caught += 1
    print(f"  Detection rate: {caught}/{len(test_spies)} ({100*caught/len(test_spies):.1f}%)")

    print("\n── Sample report for last spy event ──────────────────────")
    report = detector.observe(test_spies[-1])
    print(f"  IsoForest risk  : {report.iso_forest_score:.3f}")
    print(f"  LSTM recon loss : {report.lstm_recon_loss:.6f}")
    print(f"  Combined risk   : {report.combined_risk:.3f}")
    print(f"  Action          : {report.action}")
    print()
