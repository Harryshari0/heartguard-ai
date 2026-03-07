import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

def train_heart_model(csv_path='heart_disease.csv'):
    # 1. Load Dataset
    df = pd.read_csv(csv_path)

    # 2. Feature Selection
    X = df.drop(['target'], axis=1)
    y = df['target']

    # 3. Split Dataset
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 4. Feature Scaling
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)

    # 5. Train Logistic Regression Model
    model = LogisticRegression()
    model.fit(X_train, y_train)

    # 6. Evaluate Model
    y_pred = model.predict(X_test)
    print(f"Accuracy: {accuracy_score(y_test, y_pred)}")
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    print("Classification Report:")
    print(classification_report(y_test, y_pred))

    # 7. Save Model and Scaler
    with open('heart_model.pkl', 'wb') as f:
        pickle.dump(model, f)
    with open('scaler.pkl', 'wb') as f:
        pickle.dump(scaler, f)

    print("Model and scaler saved successfully.")

if __name__ == "__main__":
    print("Starting training process...")
    try:
        train_heart_model()
    except FileNotFoundError:
        print("Error: 'heart_disease.csv' not found. Please provide the dataset file.")
