from flask import Flask, jsonify, request

app = Flask(__name__)


@app.route("/")
def home():
    return "IndiaStockLens API"


@app.route("/api/v1/predict")
def predict():

    symbol = request.args.get("symbol")
    window = request.args.get("window", type=int)

    return jsonify({
        "status": "success",
        "symbol": symbol,
        "window_days": window
    })


@app.route("/api/v1/stocks")
def stocks():

    return jsonify({
        "stocks": []
    })


if __name__ == "__main__":
    app.run(debug=True)