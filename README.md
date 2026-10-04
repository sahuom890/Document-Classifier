---
title: Intelligent Document Classifier
emoji: 📄
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
license: mit
---

# 📄 Intelligent Document Classifier

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://document-classifier-bk37.onrender.com)
[![Python](https://img.shields.io/badge/Python-3.9%20%7C%203.10%20%7C%203.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

An AI-powered web application that classifies text and uploaded documents (`.txt`, `.pdf`, `.docx`) into categories with high confidence scoring using Natural Language Processing (NLP), TF-IDF feature extraction, and Multinomial Naive Bayes.

🔗 **Live URL:** [https://document-classifier-bk37.onrender.com](https://document-classifier-bk37.onrender.com)

---

## 🌟 Features

- 🧠 **NLP Classification Engine**: Powered by TF-IDF (15,000 max features, n-grams 1–2) + Multinomial Naive Bayes.
- 📂 **Multi-Format Document Support**: Upload and classify `.txt`, `.pdf`, and `.docx` files up to 16MB.
- 📊 **Real-Time Confidence Scoring**: Visual breakdown of category probability distributions.
- ⚡ **Interactive Web Interface**: Clean, responsive UI with instant text analysis and live file parsing.
- 📈 **Model Statistics API**: View dataset metrics, training time, test accuracy, and cross-validation scores.
- ⚡ **Model Caching**: Pre-cached weights (`joblib`) for ultra-fast startup under 0.05 seconds.

---

## 🏷️ Supported Categories

| Category | Description & Topics |
| :--- | :--- |
| 💻 **Technology** | Graphics, hardware, software, operating systems |
| 🔬 **Science** | Medicine, space exploration, electronics |
| ⚽ **Sports** | Baseball, hockey, athletics, tournaments |
| 🏛️ **Politics** | Policy, governance, socio-political discussions |
| 🕊️ **Religion** | Philosophy, theology, ethical perspectives |
| 🚗 **Automobiles** | Cars, motorcycles, automotive engineering |

---

## 🛠️ Tech Stack

- **Backend:** Python 3, Flask, Gunicorn
- **Machine Learning & NLP:** Scikit-Learn, NumPy, Joblib
- **Document Parsing:** PyPDF2 (PDFs), python-docx (Word documents)
- **Frontend:** HTML5, CSS3, JavaScript (Fetch API)

---

## 🚀 Live Demo & Deployment

### 🌐 Live Application
The project is deployed and live on Render:
👉 **[https://document-classifier-bk37.onrender.com](https://document-classifier-bk37.onrender.com)**

### Deploy Your Own Instance

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

1. Fork or clone this repository to your GitHub account.
2. Sign in to [Render](https://render.com) and click **New + > Web Service**.
3. Connect your `Document-Classifier` repository.
4. Render will automatically detect `render.yaml` or configure with:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app --workers 2 --threads 2 --timeout 120`
5. Click **Deploy Web Service** to receive your live HTTPS URL.

---

## 💻 Local Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/sahuom890/Document-Classifier.git
cd Document-Classifier
```

### 2. Create and activate a virtual environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the application
```bash
python app.py
```
Open your browser and navigate to `http://localhost:7860` (or `http://localhost:5000`).

---

## 📡 API Endpoints

### 1. Classify Raw Text
- **URL:** `/classify`
- **Method:** `POST`
- **Content-Type:** `application/json`
- **Request Body:**
```json
{
  "text": "NASA's James Webb Space Telescope observed new details in deep galaxies."
}
```
- **Response:**
```json
{
  "category": "Science",
  "confidence": 98.42,
  "all_scores": {
    "Science": 98.42,
    "Technology": 1.15,
    "Sports": 0.21,
    "Politics": 0.12,
    "Automobiles": 0.08,
    "Religion": 0.02
  },
  "text_length": 76,
  "word_count": 10
}
```

### 2. Upload Document
- **URL:** `/upload`
- **Method:** `POST`
- **Content-Type:** `multipart/form-data`
- **Form Key:** `file` (`.txt`, `.pdf`, `.docx`)

### 3. Model Statistics
- **URL:** `/stats`
- **Method:** `GET`
- **Response:**
```json
{
  "algorithm": "TF-IDF + Multinomial Naive Bayes",
  "dataset": "20 Newsgroups (6 categories)",
  "test_accuracy": 83.09,
  "cv_accuracy": 85.86,
  "train_accuracy": 93.73,
  "num_features": 15000,
  "is_trained": true
}
```

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
