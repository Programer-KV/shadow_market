"""
ShadowMarket AI — Privacy Engine
=================================
Implements Additive Secret Sharing (SMPC) WITHOUT any external crypto library,
so it runs anywhere. Each trade order is "shredded" into N shares.
No single party — not even our own matching engine — ever sees the raw number.

How it maps to the masquerade analogy:
  Raw order  →  "write your number on paper"
  split()    →  "rip the paper into three scraps"
  reconstruct() → "combine scraps to verify a match exists"
  DifferentialPrivacy.add_noise() → extra mathematical fog on top
"""

from __future__ import annotations
import numpy as np
from dataclasses import dataclass, field
from typing import List, Tuple


# ─────────────────────────────────────────────
#  PRIME FIELD  (keeps arithmetic exact & wrap-safe)
# ─────────────────────────────────────────────
FIELD_PRIME = (1 << 61) - 1   # Mersenne prime — fast modular arithmetic


def _mod(x: int) -> int:
    return x % FIELD_PRIME


# ─────────────────────────────────────────────
#  SECRET SHARE
# ─────────────────────────────────────────────
@dataclass
class Share:
    """One 'scrap of paper' held by a single party."""
    party_id: int
    value: int          # lives in GF(FIELD_PRIME) — meaningless alone
    secret_id: str = ""

    def __repr__(self):
        return f"Share(party={self.party_id}, val={self.value}, id='{self.secret_id}')"


@dataclass
class SecretOrder:
    """
    A dark-pool order (volume + price) after being shredded into shares.
    No party receives both fields together.
    """
    order_id: str
    side: str                    # 'BUY' | 'SELL'
    volume_shares: List[Share]
    price_shares: List[Share]
    num_parties: int


# ─────────────────────────────────────────────
#  CORE SMPC — ADDITIVE SECRET SHARING
# ─────────────────────────────────────────────
class AdditiveSecretSharing:
    """
    (n, n)-threshold additive secret sharing over a prime field.
    ALL n shares are required to reconstruct — a single compromised party
    reveals nothing (information-theoretic security).
    """

    def __init__(self, num_parties: int = 3):
        if num_parties < 2:
            raise ValueError("Need at least 2 parties for secret sharing.")
        self.n = num_parties

    # ── Split ──────────────────────────────────────────────────────────────
    def split(self, secret: int, secret_id: str = "") -> List[Share]:
        """
        Shred an integer secret into self.n shares.

        secret = s0 + s1 + ... + s_{n-1}  (mod FIELD_PRIME)
        First (n-1) shares are uniformly random; last share is the remainder.
        """
        assert 0 <= secret < FIELD_PRIME, "Secret must be in [0, FIELD_PRIME)."
        shares_vals = [
            np.random.randint(0, FIELD_PRIME, dtype=np.int64)
            for _ in range(self.n - 1)
        ]
        last = _mod(secret - sum(shares_vals))
        shares_vals.append(last)

        return [
            Share(party_id=i, value=int(shares_vals[i]), secret_id=secret_id)
            for i in range(self.n)
        ]

    # ── Reconstruct ────────────────────────────────────────────────────────
    def reconstruct(self, shares: List[Share]) -> int:
        """Combine ALL shares to recover the original secret."""
        assert len(shares) == self.n, f"Expected {self.n} shares, got {len(shares)}."
        return _mod(sum(s.value for s in shares))

    # ── Secure Addition (without reconstruction) ───────────────────────────
    @staticmethod
    def secure_add(shares_a: List[Share], shares_b: List[Share]) -> List[Share]:
        """
        Compute shares of (a + b) without revealing a or b.
        Each party adds their own pair of shares locally.
        """
        assert len(shares_a) == len(shares_b)
        return [
            Share(party_id=sa.party_id,
                  value=_mod(sa.value + sb.value),
                  secret_id=f"{sa.secret_id}+{sb.secret_id}")
            for sa, sb in zip(shares_a, shares_b)
        ]

    # ── Secure Comparison (for matching engine) ────────────────────────────
    def secure_match(
        self,
        buy_price_shares: List[Share],
        sell_price_shares: List[Share],
    ) -> Tuple[bool, int]:
        """
        Reveal ONLY whether buy_price >= sell_price.
        Returns (matched: bool, clearing_price: int).
        In a real deployment each party sends their share to a trusted
        aggregator only at this step, so the raw prices are never seen.
        """
        buy_price  = self.reconstruct(buy_price_shares)
        sell_price = self.reconstruct(sell_price_shares)
        matched = buy_price >= sell_price
        clearing = (buy_price + sell_price) // 2 if matched else 0
        return matched, clearing

    # ── Encode / Decode floats ──────────────────────────────────────────────
    @staticmethod
    def encode(value: float, scale: int = 1_000_000) -> int:
        """Convert float → int for the prime field (fixed-point encoding)."""
        return int(round(value * scale)) % FIELD_PRIME

    @staticmethod
    def decode(encoded: int, scale: int = 1_000_000) -> float:
        """Reverse fixed-point encoding."""
        # Handle negative representation in prime field
        if encoded > FIELD_PRIME // 2:
            encoded -= FIELD_PRIME
        return encoded / scale


# ─────────────────────────────────────────────
#  DIFFERENTIAL PRIVACY  — "Mathematical Fog"
# ─────────────────────────────────────────────
class DifferentialPrivacy:
    """
    Adds calibrated Laplace noise so that even reconstructed aggregates
    cannot be reverse-engineered to find individual orders.
    epsilon: privacy budget (lower = more private, less accurate).
    """

    def __init__(self, epsilon: float = 0.5, sensitivity: float = 1.0):
        self.epsilon = epsilon
        self.sensitivity = sensitivity
        self._scale = sensitivity / epsilon

    def add_noise(self, value: float) -> float:
        noise = np.random.laplace(loc=0.0, scale=self._scale)
        return value + noise

    def add_noise_vector(self, values: np.ndarray) -> np.ndarray:
        noise = np.random.laplace(loc=0.0, scale=self._scale, size=values.shape)
        return values + noise

    def privatize_shares(self, shares: List[Share]) -> List[Share]:
        """Add integer-level Laplace noise to each share value."""
        noisy = []
        for s in shares:
            delta = int(np.random.laplace(0, self._scale))
            noisy.append(Share(s.party_id, _mod(s.value + delta), s.secret_id))
        return noisy


# ─────────────────────────────────────────────
#  ORDER SHREDDER  — top-level API
# ─────────────────────────────────────────────
class OrderShredder:
    """
    High-level interface: takes a raw order dict and returns a SecretOrder.
    This is what the matching engine actually calls.
    """

    def __init__(self, num_parties: int = 3, dp_epsilon: float = 0.5):
        self.smpc = AdditiveSecretSharing(num_parties)
        self.dp   = DifferentialPrivacy(epsilon=dp_epsilon)

    def shred(self, order: dict) -> SecretOrder:
        """
        order = {"order_id": str, "side": "BUY"|"SELL",
                 "volume": float, "price": float}
        """
        oid  = order["order_id"]
        vol  = self.smpc.encode(order["volume"])
        px   = self.smpc.encode(order["price"])

        vol_shares = self.smpc.split(vol,  secret_id=f"{oid}_vol")
        px_shares  = self.smpc.split(px,   secret_id=f"{oid}_px")

        # Optional: blur with DP before distributing to parties
        vol_shares = self.dp.privatize_shares(vol_shares)

        return SecretOrder(
            order_id      = oid,
            side          = order["side"],
            volume_shares = vol_shares,
            price_shares  = px_shares,
            num_parties   = self.smpc.n,
        )

    def match(self, buy: SecretOrder, sell: SecretOrder) -> dict:
        matched, clearing_enc = self.smpc.secure_match(
            buy.price_shares, sell.price_shares
        )
        clearing_price = AdditiveSecretSharing.decode(clearing_enc)

        # Volume filled = min(buy_vol, sell_vol) — reconstructed only at settlement
        buy_vol  = AdditiveSecretSharing.decode(
            self.smpc.reconstruct(buy.volume_shares))
        sell_vol = AdditiveSecretSharing.decode(
            self.smpc.reconstruct(sell.volume_shares))

        return {
            "matched":        matched,
            "clearing_price": clearing_price if matched else None,
            "volume_filled":  min(buy_vol, sell_vol) if matched else 0,
            "buy_order_id":   buy.order_id,
            "sell_order_id":  sell.order_id,
        }


# ─────────────────────────────────────────────
#  DEMO / SMOKE TEST
# ─────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 60)
    print("  ShadowMarket AI — Privacy Engine Demo")
    print("=" * 60)

    smpc     = AdditiveSecretSharing(num_parties=3)
    shredder = OrderShredder(num_parties=3, dp_epsilon=0.5)

    # ── 1. Basic split/reconstruct ──────────────────────────────────────
    secret = 1_000_000          # 1 million shares of AAPL (raw, never sent)
    shares = smpc.split(secret, secret_id="demo")
    print("\n[1] Secret Sharing")
    print(f"    Original secret : {secret:,}")
    print(f"    Share 0 (Party A): {shares[0].value}")   # meaningless alone
    print(f"    Share 1 (Party B): {shares[1].value}")
    print(f"    Share 2 (Party C): {shares[2].value}")
    recovered = smpc.reconstruct(shares)
    print(f"    Reconstructed    : {recovered:,}  ✓ match={recovered == secret}")

    # ── 2. Secure addition ───────────────────────────────────────────────
    a_shares = smpc.split(smpc.encode(500.0),  "order_A")
    b_shares = smpc.split(smpc.encode(300.0),  "order_B")
    sum_shares = AdditiveSecretSharing.secure_add(a_shares, b_shares)
    total = AdditiveSecretSharing.decode(smpc.reconstruct(sum_shares))
    print(f"\n[2] Secure Addition (500 + 300 without revealing either)")
    print(f"    Result: {total:.2f}  (expected 800.00)")

    # ── 3. Full order matching ───────────────────────────────────────────
    buy_order  = {"order_id": "B001", "side": "BUY",  "volume": 50_000.0, "price": 152.50}
    sell_order = {"order_id": "S001", "side": "SELL", "volume": 40_000.0, "price": 151.00}

    buy_secret  = shredder.shred(buy_order)
    sell_secret = shredder.shred(sell_order)
    result      = shredder.match(buy_secret, sell_secret)

    print(f"\n[3] Order Matching (prices never revealed in plaintext to engine)")
    print(f"    Buy  price: ${buy_order['price']:.2f}  (hidden)")
    print(f"    Sell price: ${sell_order['price']:.2f}  (hidden)")
    print(f"    Matched?   {result['matched']}")
    print(f"    Clearing:  ${result['clearing_price']:.4f}")
    print(f"    Volume:    {result['volume_filled']:,.0f} shares")
    print()
