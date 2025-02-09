import React, { useState, useEffect } from "react";
import axios from "axios";

const WeatherBox = ({ location }) => {
  const [weather, setWeather] = useState(null);
  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

  console.log("API Key:", API_KEY);

  if (!API_KEY) {
    console.error("API Key is not defined. Check your .env file and restart the server.");
  }
  

  useEffect(() => {
    if (!location) return;

    const fetchWeather = async () => {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${API_KEY}`
        );
        setWeather(response.data);
      } catch (error) {
        console.error("Error fetching weather data", error);
      }
    };

    fetchWeather();
  }, [location]);

  return (
    <div className="weather-box">
      {weather ? (
        <>
          <h3>{weather.name}</h3>
          <p>{weather.weather[0].description}</p>
          <p>🌡️ {weather.main.temp}°C</p>
          <p>💨 Wind: {weather.wind.speed} m/s</p>
        </>
      ) : (
        <p>Loading weather...</p>
      )}
    </div>
  );
};

export default WeatherBox;
