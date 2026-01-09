The project content is available in both master and main branches.

# Mind Insight Dashboard - AI Mental Health Analysis Platform

This project is an integrated solution that combines a **FastAPI** backend powered by **Artificial Intelligence (BERT)** and a modern **React** frontend. It is designed to analyze mental health states based on Twitter activity and manage a database of doctors and patients.

## 🚀 Key Features

*   **AI-Powered Analysis:** Uses a fine-tuned **BERT** (Bidirectional Encoder Representations from Transformers) model to classify text into five categories: `Normal`, `Stressed`, `Anxiety`, `Depression`, and `Potential Suicide Post`.
*   **Twitter Integration:** Real-time fetching of user tweets using the **Twitter API (Tweepy)**.
*   **Healthcare Management:** Dedicated modules for managing **Doctor** and **Patient** registrations via a **MongoDB** database.
*   **Asynchronous & Robust Backend:** Built with FastAPI, featuring automated database connection lifecycle management (startup/shutdown events) and comprehensive error handling.
*   **Modern UI:** A responsive dashboard interface for visualizing analysis results and managing records.

## 🛠️ Technology Stack

### Backend
*   **FastAPI:** High-performance web framework.
*   **PyTorch & Transformers:** For deep learning model inference.
*   **MongoDB (Pymongo):** NoSQL database for doctor/patient data.
*   **Tweepy:** For Twitter data scraping.
*   **Pydantic:** Data validation and settings management.

### Frontend
*   **React:** UI components.
*   **TypeScript:** Type-safe development.
*   **Vite:** Frontend tooling and bundling.

## 📋 Prerequisites

*   **Python 3.9+**
*   **Node.js & npm**
*   **MongoDB Instance** (Local or MongoDB Atlas)
*   **Twitter Developer Account** (to obtain a Bearer Token)

## ⚙️ Configuration

Create a `.env` file in the backend root directory and configure the following variables:

```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/
MONGO_DB_NAME=docteurs_ia_db

# Twitter API Configuration
TWITTER_BEARER_TOKEN=your_bearer_token_here

# AI Model Configuration
MODEL_PATH=model/bert_mental_health_model.bin


#Backend Setup

# Install required Python packages
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload


#Frontend Setup

# Install dependencies
npm install

# Run the development server
npm run dev

