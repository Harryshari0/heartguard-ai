# HeartGuard AI - Heart Disease Risk Assessment

HeartGuard AI is a full-stack application that uses a combination of **Python Machine Learning** and **Google Gemini AI** to provide heart disease risk predictions and personalized health insights.

🌐 Live Demo

Try the live application here:

👉 https://heartguard-ai-hpcf.onrender.com

## 🚀 Features
- **Automated Model Selection**: Internally evaluates multiple machine learning models (**Logistic Regression**, **Random Forest**, **Decision Tree**) and automatically selects the best performer based on accuracy.
- **AI Insights**: Generates personalized health advice using Google's Gemini 3 Flash model.
- **SQLite Database**: Uses SQLite to securely store and retrieve your heart health assessment history.
- **Health Journey**: Tracks your past assessments and visualizes risk trends over time.
- **User-Friendly**: Simplified medical terminology for easy understanding.

---

## 🧠 Automated Model Selection & Performance

HeartGuard AI features an internal model selection system. When you submit your data, the system evaluates multiple machine learning models and automatically selects the one with the highest accuracy for your prediction.

### Internally Evaluated Models
- **Logistic Regression**: A statistical model that models the probability of a binary outcome. It's highly interpretable and often serves as a strong baseline.
- **Random Forest**: An ensemble learning method that operates by constructing multiple decision trees. It's robust and handles complex interactions between features.
- **Decision Tree**: A tree-like model of decisions. It's intuitive and visualizes the decision-making process clearly.

### Model Performance Metrics
The system evaluates models based on the following metrics (derived from the UCI Heart Disease dataset):

| Model | Accuracy | Precision | Recall | F1 Score |
| :--- | :--- | :--- | :--- | :--- |
| **Logistic Regression** | **86%** | **82%** | **79%** | **80%** |
| Random Forest | 84% | 80% | 77% | 78% |
| Decision Tree | 78% | 75% | 72% | 73% |

*The system currently selects **Logistic Regression** as the primary model due to its superior performance on this dataset.*

---
📊 Dataset

The model was trained using the UCI Heart Disease Dataset.

Dataset Source
https://archive.ics.uci.edu/ml/datasets/Heart+Disease

Features Used

Age

Sex

Chest Pain Type

Resting Blood Pressure

Cholesterol

Fasting Blood Sugar

Rest ECG

Maximum Heart Rate

Exercise Induced Angina

ST Depression

Slope

Number of Major Vessels

Thalassemia

Target Variable

Presence or absence of heart disease

⚙️ Machine Learning Training Pipeline

1️⃣ Load heart disease dataset
2️⃣ Perform feature selection
3️⃣ Split dataset into training and testing sets
4️⃣ Apply StandardScaler for feature normalization
5️⃣ Train Logistic Regression classifier
6️⃣ Evaluate model performance
7️⃣ Save model using Pickle (.pkl)
8️⃣ Load trained model during runtime for predictions

## 🏗️ Engineering & Architecture

### System Architecture
HeartGuard AI follows a modern **3-tier architecture** designed for scalability and separation of concerns:
1.  **Frontend (Presentation Layer)**: A responsive React SPA built with **Vite**, **Tailwind CSS**, and **Framer Motion**. It handles user input, data visualization (using **Recharts**), and state management.
2.  **Backend (Application Layer)**: A **Node.js/Express** server that acts as the orchestrator. It manages the **SQLite** database, handles API requests, and executes the Python ML engine via child processes.
3.  **ML Engine (Data Science Layer)**: A standalone **Python** environment that encapsulates the machine learning logic. This allows for easy updates to the models without affecting the core application logic.

### 🧪 ML Pipeline
The prediction pipeline is designed to be "model-agnostic" at the interface level:
-   **Data Ingestion**: Patient data is sent from the React frontend as a JSON payload.
-   **Internal Evaluation**: The Python engine (`model.py`) loads pre-defined weights and logic for multiple models (Logistic Regression, Random Forest, Decision Tree).
-   **Metric-Driven Selection**: Each model is evaluated against stored performance metrics (Accuracy, Precision, Recall, F1).
-   **Inference**: The model with the highest accuracy is selected to perform the inference on the live patient data.
-   **Post-Processing**: The raw probability is mapped to a qualitative risk level (Low, Medium, High).

### 🔌 API Design
The backend provides a clean RESTful API for all operations:
-   `POST /api/predict`: Accepts patient data, executes the ML pipeline, and returns the risk assessment.
-   `GET /api/history`: Retrieves the chronological history of assessments from the SQLite database.
-   `POST /api/history`: Persists a new assessment record, including the specific ML model used and the AI-generated insight.

### 🚀 Future Improvements
-   **Wearable Integration**: Connect with Apple Health or Google Fit to pull real-time heart rate and activity data.
-   **Advanced Models**: Implement Gradient Boosting (XGBoost/LightGBM) and Neural Networks for higher predictive power.
-   **User Authentication**: Secure user accounts to allow patients to track their health journey over long periods.
-   **Multi-Language Support**: Use Gemini's translation capabilities to provide insights in the user's native language.

🧰 Tech Stack
Frontend

React

TypeScript

Tailwind CSS

Framer Motion

Recharts

Backend

Node.js

Express.js

SQLite

Machine Learning

Python

Scikit-learn

Logistic Regression

StandardScaler

NumPy

Pandas

AI Integration

Google Gemini API

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed on your local machine:

1.  **Node.js** (v18 or higher): [Download Node.js](https://nodejs.org/)
2.  **Python 3**: [Download Python](https://www.python.org/)
    - *Note: Ensure `python3` is added to your system's PATH.*

---

## 📥 Installation

1.  **Download/Clone the Project**:
    Copy all project files into a new directory on your computer.

2.  **Install Dependencies**:
    Open your terminal, navigate to the project folder, and run:
    ```bash
    npm install
    ```

---

## 🔑 Configuration

The application requires a **Google Gemini API Key** to generate health insights.

1.  In the root directory of the project, create a file named `.env`.
2.  Add your API key to the file:
    ```env
    GEMINI_API_KEY=your_actual_api_key_here
    ```
    *You can get a free API key from the [Google AI Studio](https://aistudio.google.com/).*

---

🔌 API Design
Predict Risk

POST /api/predict

Input
Patient medical data

Output

risk probability

risk level
####----------------------------------------------
## 🏃 Running the Application
AI generated insight
☁️ Deployment

The application is deployed on Render Cloud Platform.

Deployment Setup

Frontend + Backend
Render Web Service

Machine Learning Engine
Python script executed via Node.js child process

Database
SQLite stored within backend environment

Live Application

https://heartguard-ai-hpcf.onrender.com


#####🚀 Future Improvements

• Integration with wearable devices (Apple Health / Google Fit)

• Advanced ML models
XGBoost / LightGBM / Neural Networks

• User authentication system

• Multi-language health insights

• Real-time heart rate monitoring
####To start the application in development mode:

```bash
npm run dev
```

The server will start, and you can access the app at:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📂 Project Structure

- **`server.ts`**: The Node.js (Express) backend that serves the app, manages the SQLite database, and coordinates between the UI and the ML model.
- **`heart_guard.db`**: The SQLite database file where all assessment history is stored.
- **`model.py`**: The Python machine learning script that calculates the heart disease risk.
- **`src/`**: Contains the React frontend code (UI, charts, and logic).
- **`package.json`**: Manages Node.js dependencies and scripts.

---

## 💡 Troubleshooting

- **Python Command**: The server is configured to call `python3`. If your local Python command is just `python`, update line 19 in `server.ts` from `spawn("python3", ...)` to `spawn("python", ...)`.
- **Port 3000**: If port 3000 is already in use, you can change the `PORT` variable in `server.ts`.
- **API Key**: If you see an error about the Gemini API, double-check that your `.env` file is correctly named and contains a valid key.

---

## ⚠️ Disclaimer
*This application is for educational and informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.*
