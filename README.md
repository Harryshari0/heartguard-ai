# HeartGuard AI - Heart Disease Risk Assessment

HeartGuard AI is a full-stack application that uses a combination of **Python Machine Learning** and **Google Gemini AI** to provide heart disease risk predictions and personalized health insights.

## 🚀 Features
- **Selectable ML Models**: Choose between **Logistic Regression**, **Random Forest**, and **Decision Tree** to see how different algorithms assess your risk.
- **AI Insights**: Generates personalized health advice using Google's Gemini 3 Flash model.
- **SQLite Database**: Uses SQLite to securely store and retrieve your heart health assessment history.
- **Health Journey**: Tracks your past assessments and visualizes risk trends over time.
- **User-Friendly**: Simplified medical terminology for easy understanding.

---

## 🧠 Model Selection & Performance

HeartGuard AI allows you to compare multiple machine learning models. Each model provides a different perspective on heart disease risk based on the UCI Heart Disease dataset.

### Available Models
- **Logistic Regression**: A statistical model that models the probability of a binary outcome. It's highly interpretable and serves as our baseline.
- **Random Forest**: An ensemble learning method that operates by constructing multiple decision trees. It's robust and handles complex interactions between features.
- **Decision Tree**: A tree-like model of decisions. It's intuitive and visualizes the decision-making process clearly.

### Baseline Performance (Logistic Regression)
The baseline Logistic Regression model achieved the following metrics:
- **Accuracy**: 86%
- **Precision**: 82%
- **Recall**: 79%
- **F1 Score**: 80%

---

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

## 🏃 Running the Application

To start the application in development mode:

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
