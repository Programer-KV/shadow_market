"""
ShadowMarket AI — Main Orchestration
=======================================
Ties together all three Member 3 components:
  1. Privacy Engine (Additive Secret Sharing + Differential Privacy)
  2. Spy Detector (Isolation Forest + LSTM Autoencoder)
  3. Feature Engineering (Liquidity Scores + TWAP Scheduler)

Run this script to see the full pipeline in action.
"""

from __future__ import annotations
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from secret_sharing import (
    OrderShredder, AdditiveSecretSharing, DifferentialPrivacy
)
from spy_detector import (
    SpyDetector, MarketDataSimulator
)
from liquidity_features import (
    LiquidityFeatureEngine, generate_ohlcv, TWAPScheduler
)
import numpy as np


def run_pipeline():
    print("\n" + "=" * 70)
    print("  ███████╗██╗  ██╗ █████╗ ██████╗  ██████╗ ██╗    ██╗")
    print("  ██╔════╝██║  ██║██╔══██╗██╔══██╗██╔═══██╗██║    ██║")
    print("  ███████╗███████║███████║██║  ██║██║   ██║██║ █╗ ██║")
    print("  ╚════██║██╔══██║██╔══██║██║  ██║██║   ██║██║███╗██║")
    print("  ███████║██║  ██║██║  ██║██████╔╝╚██████╔╝╚███╔███╔╝")
    print("  ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝  ╚═════╝  ╚══╝╚══╝ ")
    print("                   M A R K E T   A I")
    print("  Ivy Plus 2026 Hackathon — Member 3: Quant & Privacy")
    print("=" * 70)

    # ──────────────────────────────────────────────────────────────────
    # STEP 1: FEATURE ENGINEERING
    # ──────────────────────────────────────────────────────────────────
    print("\n\n📊 STEP 1: LIQUIDITY FEATURE ENGINEERING")
    print("-" * 50)
    ohlcv    = generate_ohlcv(n_bars=500, ticker="AAPL")
    engine   = LiquidityFeatureEngine(window=20)
    features = engine.transform(ohlcv)

    avg_score  = features["liquidity_score"].mean()
    regime_pct = features["liquidity_regime"].value_counts(normalize=True) * 100
    print(f"  Average Liquidity Score : {avg_score:.1f} / 100")
    print(f"  LIQUID regime           : {regime_pct.get('LIQUID', 0):.1f}% of bars")
    print(f"  NORMAL regime           : {regime_pct.get('NORMAL', 0):.1f}% of bars")
    print(f"  ILLIQUID regime         : {regime_pct.get('ILLIQUID', 0):.1f}% of bars")

    # TWAP schedule for a large institutional order
    scheduler = TWAPScheduler(total_shares=500_000, n_slices=10)
    schedule  = scheduler.schedule(features)
    print(f"\n  TWAP schedule for 500,000 shares (last 10 bars):")
    print("  " + schedule[["liquidity_score", "scheduled_shares",
                            "participation_rate"]].to_string().replace("\n", "\n  "))

    # ──────────────────────────────────────────────────────────────────
    # STEP 2: PRIVACY ENGINE — shred the order
    # ──────────────────────────────────────────────────────────────────
    print("\n\n🔐 STEP 2: PRIVACY ENGINE — SMPC ORDER SHREDDING")
    print("-" * 50)

    shredder = OrderShredder(num_parties=3, dp_epsilon=0.5)

    # Simulate two institutional orders meeting in the dark pool
    buy_order = {
        "order_id": "INST-BUY-001",
        "side":     "BUY",
        "volume":   schedule["scheduled_shares"].iloc[-1] * 1.0,
        "price":    features["close"].iloc[-1] * 1.002,   # willing to pay slight premium
    }
    sell_order = {
        "order_id": "INST-SELL-001",
        "side":     "SELL",
        "volume":   schedule["scheduled_shares"].iloc[-1] * 0.8,
        "price":    features["close"].iloc[-1] * 0.999,   # sell slightly below close
    }

    print(f"  Buy  order: {buy_order['volume']:,.0f} @ ${buy_order['price']:.2f}  (HIDDEN)")
    print(f"  Sell order: {sell_order['volume']:,.0f} @ ${sell_order['price']:.2f}  (HIDDEN)")

    buy_secret  = shredder.shred(buy_order)
    sell_secret = shredder.shred(sell_order)

    print(f"\n  Buy volume shreds  : {[s.value for s in buy_secret.volume_shares]}")
    print(f"  Sell volume shreds : {[s.value for s in sell_secret.volume_shares]}")
    print(f"  (Each number above is meaningless in isolation — this is the shredder)")

    result = shredder.match(buy_secret, sell_secret)
    print(f"\n  ✓ Matched?         {result['matched']}")
    print(f"  ✓ Clearing price : ${result['clearing_price']:.4f}")
    print(f"  ✓ Volume filled  : {result['volume_filled']:,.0f} shares")

    # ──────────────────────────────────────────────────────────────────
    # STEP 3: SPY DETECTOR
    # ──────────────────────────────────────────────────────────────────
    print("\n\n🕵️  STEP 3: SPY DETECTOR — ISOLATION FOREST + LSTM")
    print("-" * 50)
    sim     = MarketDataSimulator()
    normal  = sim.normal_events(n=2000)
    spies   = sim.spy_events(n=100)

    detector = SpyDetector(seq_len=20)
    detector.fit(normal, lstm_epochs=15)

    # Test detection
    test_normal = sim.normal_events(n=80,  seed=111)
    test_spies  = sim.spy_events(n=50,   seed=222)

    fn = sum(1 for e in test_normal if detector.observe(e).action in ("BLOCK", "THROTTLE"))
    detector._buffer.clear()
    tp = sum(1 for e in test_spies  if detector.observe(e).action in ("BLOCK", "THROTTLE"))

    print(f"\n  False positive rate    : {fn}/{len(test_normal)} ({100*fn/len(test_normal):.1f}%)")
    print(f"  Spy detection rate     : {tp}/{len(test_spies)} ({100*tp/len(test_spies):.1f}%)")

    # Show last report
    detector._buffer.clear()
    last_report = None
    for e in test_spies:
        last_report = detector.observe(e)
    if last_report:
        print(f"\n  Last spy event report:")
        print(f"    IsoForest risk  : {last_report.iso_forest_score:.3f}")
        print(f"    LSTM loss       : {last_report.lstm_recon_loss:.6f}")
        print(f"    Combined risk   : {last_report.combined_risk:.3f}")
        print(f"    Action          : {last_report.action}  🚨")

    # ──────────────────────────────────────────────────────────────────
    # FINAL SUMMARY
    # ──────────────────────────────────────────────────────────────────
    print("\n\n" + "=" * 70)
    print("  ✅  PIPELINE COMPLETE — All three components operational.")
    print()
    print("  Deliverables for the Matching Engine (Member 1):")
    print("    • liquidity_score (0-100) per bar   → route orders optimally")
    print("    • liquidity_regime label            → agent context")
    print("    • scheduled_shares per time slice   → TWAP execution plan")
    print()
    print("  Deliverables for Dark Pool (Member 2):")
    print("    • SecretOrder objects (shredded)    → no raw price/volume")
    print("    • AnomalyReport per order event     → block spy agents")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    run_pipeline()
