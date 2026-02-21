from flask import Flask, request, jsonify
from secret_sharing import OrderShredder, AdditiveSecretSharing
from spy_detector import SpyDetector, MarketDataSimulator, OrderEvent
from liquidity_features import LiquidityFeatureEngine, generate_ohlcv, TWAPScheduler

app = Flask(__name__)

# Initialize once at startup
shredder = OrderShredder(num_parties=3, dp_epsilon=0.5)
detector = SpyDetector(seq_len=20)

# Train detector on startup (in production, load a pre-trained model)
sim = MarketDataSimulator()
detector.fit(sim.normal_events(n=2000), lstm_epochs=10)

engine = LiquidityFeatureEngine(window=20)
ohlcv = generate_ohlcv(n_bars=300)
features = engine.transform(ohlcv)


@app.route("/shred", methods=["POST"])
def shred_order():
    """Member 2 calls this when a user places an order."""
    order = request.json
    secret = shredder.shred(order)
    return jsonify({
        "order_id": secret.order_id,
        "side": secret.side,
        "volume_shares": [s.value for s in secret.volume_shares],
        "price_shares":  [s.value for s in secret.price_shares],
    })


@app.route("/match", methods=["POST"])
def match_orders():
    """Member 2 calls this when trying to match a buy + sell."""
    data = request.json
    # Reconstruct SecretOrder objects from the share values passed in
    # (in production these come from your smart contracts)
    buy_shares  = [type('S', (), {'value': v, 'party_id': i, 'secret_id': ''})()
                   for i, v in enumerate(data["buy_price_shares"])]
    sell_shares = [type('S', (), {'value': v, 'party_id': i, 'secret_id': ''})()
                   for i, v in enumerate(data["sell_price_shares"])]
    matched, clearing = shredder.smpc.secure_match(buy_shares, sell_shares)
    return jsonify({
        "matched": matched,
        "clearing_price": AdditiveSecretSharing.decode(clearing) if matched else None,
    })


@app.route("/check-spy", methods=["POST"])
def check_spy():
    """Member 2 calls this on every order event before allowing it."""
    d = request.json
    event = OrderEvent(**d)
    report = detector.observe(event)
    return jsonify({
        "action": report.action,
        "risk_score": round(report.combined_risk, 3),
        "is_anomalous": report.is_anomalous,
    })


@app.route("/liquidity", methods=["GET"])
def get_liquidity():
    """Member 2 calls this to show real-time liquidity on the dashboard."""
    recent = features[["liquidity_score", "liquidity_regime"]].tail(20)
    return jsonify(recent.reset_index().to_dict(orient="records"))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
