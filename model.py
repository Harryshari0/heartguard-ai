import sys
import json
import pickle
import numpy as np

# Load trained model
with open("heart_model.pkl", "rb") as f:
    model = pickle.load(f)

# Load scaler
with open("scaler.pkl", "rb") as f:
    scaler = pickle.load(f)


def predict_heart_risk(data):

    features = [
        data.get("age", 0),
        data.get("sex", 0),
        data.get("cp", 0),
        data.get("trestbps", 0),
        data.get("chol", 0),
        data.get("fbs", 0),
        data.get("restecg", 0),
        data.get("thalach", 0),
        data.get("exang", 0),
        data.get("oldpeak", 0),
        data.get("slope", 0),
        data.get("ca", 0),
        data.get("thal", 0)
    ]

    X = np.array(features).reshape(1, -1)

    X_scaled = scaler.transform(X)

    probability = model.predict_proba(X_scaled)[0][1]

    risk = "Low"
    if probability >= 0.55:
        risk = "High"
    elif probability >= 0.30:
        risk = "Medium"

    return {
        "probability": float(probability),
        "riskLevel": risk,
        "modelUsed": "logistic_regression_trained"
    }


if __name__ == "__main__":
    try:
        input_data = sys.stdin.read()
        data = json.loads(input_data)

        result = predict_heart_risk(data)

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)