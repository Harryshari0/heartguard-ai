import sys
import json
import math

# Simple Logistic Regression weights for Heart Disease Prediction
# These are rough approximations based on the UCI Heart Disease dataset
WEIGHTS = {
    'intercept': -10.0,
    'age': 0.02,
    'sex': 0.8,
    'cp': 0.5,
    'trestbps': 0.02,
    'chol': 0.01,
    'fbs': 0.4,
    'restecg': 0.3,
    'thalach': -0.05,
    'exang': 0.9,
    'oldpeak': 0.6,
    'slope': 0.4,
    'ca': 0.8,
    'thal': 0.5,
}

def sigmoid(z):
    return 1 / (1 + math.exp(-z))

def predict_logistic_regression(data):
    z = WEIGHTS['intercept']
    z += data.get('age', 0) * WEIGHTS['age']
    z += (1 if data.get('sex') == 1 else 0) * WEIGHTS['sex']
    z += data.get('cp', 0) * WEIGHTS['cp']
    z += data.get('trestbps', 0) * WEIGHTS['trestbps']
    z += data.get('chol', 0) * WEIGHTS['chol']
    z += (1 if data.get('fbs') == 1 else 0) * WEIGHTS['fbs']
    z += data.get('restecg', 0) * WEIGHTS['restecg']
    z += data.get('thalach', 0) * WEIGHTS['thalach']
    z += (1 if data.get('exang') == 1 else 0) * WEIGHTS['exang']
    z += data.get('oldpeak', 0) * WEIGHTS['oldpeak']
    z += data.get('slope', 0) * WEIGHTS['slope']
    z += data.get('ca', 0) * WEIGHTS['ca']
    z += data.get('thal', 0) * WEIGHTS['thal']
    return sigmoid(z)

def predict_decision_tree(data):
    # Simplified Decision Tree logic based on key features
    score = 0
    if data.get('ca', 0) > 0: score += 0.3
    if data.get('cp', 0) == 0: score += 0.2 # Typical angina is often less risky than asymptomatic in UCI
    if data.get('thalach', 0) < 140: score += 0.2
    if data.get('oldpeak', 0) > 2.0: score += 0.2
    if data.get('exang') == 1: score += 0.1
    
    # Base risk + score
    return min(0.95, max(0.05, 0.1 + score))

def predict_random_forest(data):
    # Simulated Random Forest (Ensemble of Logistic and Tree logic)
    p1 = predict_logistic_regression(data)
    p2 = predict_decision_tree(data)
    # Add a third "voter" based on age and cholesterol
    p3 = 0.1
    if data.get('age', 0) > 60: p3 += 0.2
    if data.get('chol', 0) > 240: p3 += 0.2
    
    return (p1 + p2 + p3) / 2.2

def predict_heart_risk(data):
    model_type = data.get('modelType', 'logistic_regression')
    
    if model_type == 'decision_tree':
        probability = predict_decision_tree(data)
    elif model_type == 'random_forest':
        probability = predict_random_forest(data)
    else:
        probability = predict_logistic_regression(data)

    risk_level = "Low"
    if probability > 0.7:
        risk_level = "High"
    elif probability > 0.4:
        risk_level = "Medium"

    return {
        "probability": probability,
        "riskLevel": risk_level,
        "modelUsed": model_type
    }

if __name__ == "__main__":
    # Read input from stdin
    try:
        input_data = sys.stdin.read()
        if not input_data:
            sys.exit(0)
            
        data = json.loads(input_data)
        result = predict_heart_risk(data)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
