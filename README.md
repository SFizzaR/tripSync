# TripSync 
### Smart Itinerary Planning & Recommendation System

## Overview

**Trip Sync** is a collaborative trip planning application that helps users manage itineraries, coordinate with friends, receive intelligent place recommendations, and stay updated with real-time weather data. The system combines modern full-stack development with AI-driven recommendation engines and weather integration for a seamless travel planning experience.

![image](https://github.com/user-attachments/assets/9c95b3a1-c2fd-43e0-b358-9e852090726a)


## Core Features

* **Personalised Dashboard**: Get current location weather, and personal calendar to keep track of upcoming events

![image](https://github.com/user-attachments/assets/6d1e4fa9-d0ba-4e64-8fc1-94271af41400)

* **Itinerary Management**: Create, update, and delete solo or collaborative itineraries

![image](https://github.com/user-attachments/assets/d5111ab3-81f5-4062-9981-65f56e50ab2e)

* **Collaborative Planning**: Invite users, accept/reject invites, and plan together

![image](https://github.com/user-attachments/assets/1289e32b-d288-47f0-a229-9cd3ee4eb022)
  
* **Place Recommendations**: Personalized based on city and user preferences

![image](https://github.com/user-attachments/assets/67538827-d337-407f-91a4-63564a8f967b)

* **Weather Insights**: Real-time and synthetic weather data for planning
* **Notification System**: Keeps users informed about invites and activity
* **User Authentication**: Secure login and profile management


## Tech Stack

### Languages & Frameworks

* **Python** – Core language for AI/ML modules
* **Flask** – Backend web framework
* **JavaScript / React** – Frontend interface
* **MongoDB** – NoSQL database for storing users, itineraries, places, and notifications
* **Node.js** – Backend functionalities

### AI & Recommendation

* **Surprise** – Collaborative filtering using SVD
* **Scikit-learn** – TF-IDF and cosine similarity for content-based filtering
* **TensorFlow/Keras** – Neural network models

### External APIs

* **Foursquare API** – Place details, reviews, photos
* **Firebase (FCM)** – Push notifications
* **NOAA API** – Meteorological weather data
* **Meteosat** – Satellite-based weather intelligence


## AI Recommendation Module

1. **Collaborative Filtering (SVD)**: Learns from user ratings to suggest places
2. **Content-Based Filtering (TF-IDF + Cosine Similarity)**: Recommends based on place metadata

## Weather Module

* Retrieves weather data from **NOAA** and **Meteosat**
* Auto-generates synthetic data if APIs fail
* Schedules weather-based itineraries 

