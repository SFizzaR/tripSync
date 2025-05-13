# 🌍 Trip Sync – Smart Itinerary Planning & Recommendation System

## 📖 Overview

**Trip Sync** is a collaborative trip planning application that helps users manage itineraries, coordinate with friends, receive intelligent place recommendations, and stay updated with real-time weather data. The system combines modern full-stack development with AI-driven recommendation engines and weather integration for a seamless travel planning experience.


## 🛠️ Tech Stack

### 💻 Languages & Frameworks

* **Python** – Core language for AI/ML modules
* **Flask** – Backend web framework
* **JavaScript / React** – Frontend interface
* **MongoDB** – NoSQL database for storing users, itineraries, places, and notifications

### 🧠 AI & Recommendation

* **Surprise** – Collaborative filtering using SVD
* **Scikit-learn** – TF-IDF and cosine similarity for content-based filtering
* **TensorFlow/Keras** – Neural network models (optional enhancements)

### 📦 Libraries

* **Pandas** – Data manipulation
* **Requests** – External API handling

### 🔗 External APIs

* **Foursquare API** – Place details, reviews, photos
* **Firebase (FCM)** – Push notifications
* **NOAA API** – Meteorological weather data
* **Meteosat** – Satellite-based weather intelligence
* **Synthetic Weather Generator** – Handles unavailable/missing data

## 🧩 Core Features

* ✈️ **Itinerary Management**: Create, update, and delete solo or collaborative itineraries
* 🧑‍🤝‍🧑 **Collaborative Planning**: Invite users, accept/reject invites, and plan together
* 📍 **Place Recommendations**: Personalized based on city and user preferences
* ☀️ **Weather Insights**: Real-time and synthetic weather data for planning
* 🔔 **Notification System**: Keeps users informed about invites and activity
* 🔐 **User Authentication**: Secure login and profile management


## 📊 AI Recommendation Module

1. **Collaborative Filtering (SVD)**: Learns from user ratings to suggest places
2. **Content-Based Filtering (TF-IDF + Cosine Similarity)**: Recommends based on place metadata
3. **Hybrid Recommendation**: Combines both for optimal results

## 🌤️ Weather Module

* Retrieves weather data from **NOAA** and **Meteosat**
* Auto-generates synthetic data if APIs fail
* Displays weather directly on the user’s dashboard

## 🚀 Getting Started

```bash
# Backend setup
cd backend
pip install -r requirements.txt
python app.py

# Frontend setup
cd frontend
npm install
npm start
```
