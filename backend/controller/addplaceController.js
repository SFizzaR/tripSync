const expressAsyncHandler = require("express-async-handler");
const dotenv = require("dotenv").config();
const Places = require("../models/placesModel");
const axios=require('axios');

const cities = [
    { "city": "Abu Dhabi", "country": "UAE" },
    { "city": "Agra", "country": "India" },
    { "city": "Amsterdam", "country": "Netherlands" },
    { "city": "Athens", "country": "Greece" },
    { "city": "Auckland", "country": "New Zealand" },
    { "city": "Bali", "country": "Indonesia" },
    { "city": "Bangkok", "country": "Thailand" },
    { "city": "Barcelona", "country": "Spain" },
    { "city": "Beijing", "country": "China" },
    { "city": "Berlin", "country": "Germany" },
    { "city": "Cairo", "country": "Egypt" },
    { "city": "Cape Town", "country": "South Africa" },
    { "city": "Dubai", "country": "UAE" },
    { "city": "Dublin", "country": "Ireland" },
    { "city": "Florence", "country": "Italy" },
    { "city": "Hanoi", "country": "Vietnam" },
    { "city": "Hong Kong", "country": "China" },
    { "city": "Istanbul", "country": "Turkey" },
    { "city": "Jakarta", "country": "Indonesia" },
    { "city": "Kuala Lumpur", "country": "Malaysia" },
    { "city": "Kyoto", "country": "Japan" },
    { "city": "Lisbon", "country": "Portugal" },
    { "city": "London", "country": "UK" },
    { "city": "Los Angeles", "country": "USA" },
    { "city": "Madrid", "country": "Spain" },
    { "city": "Manila", "country": "Philippines" },
    { "city": "Melbourne", "country": "Australia" },
    { "city": "Moscow", "country": "Russia" },
    { "city": "Munich", "country": "Germany" },
    { "city": "New Delhi", "country": "India" },
    { "city": "New York", "country": "USA" },
    { "city": "Osaka", "country": "Japan" },
    { "city": "Paris", "country": "France" },
    { "city": "Prague", "country": "Czech Republic" },
    { "city": "Rio de Janeiro", "country": "Brazil" },
    { "city": "Rome", "country": "Italy" },
    { "city": "Seoul", "country": "South Korea" },
    { "city": "Shanghai", "country": "China" },
    { "city": "Singapore", "country": "Singapore" },
    { "city": "Sydney", "country": "Australia" },
    { "city": "Tokyo", "country": "Japan" },
    { "city": "Toronto", "country": "Canada" },
    { "city": "Venice", "country": "Italy" },
    { "city": "Vienna", "country": "Austria" },
    { "city": "Warsaw", "country": "Poland" } 
];

const FOURSQUARE_API_KEY = process.env.FOURSQUARE_API;
const FOURSQUARE_API_URL = "https://api.foursquare.com/v3/places/search";

const fetchAndStorePlaces = expressAsyncHandler(async (req, res) => {
    for (const cityData of cities) {
        const { city, country } = cityData;
        
        try {
            const response = await axios.get(FOURSQUARE_API_URL, {
                headers: {
                    "Authorization": FOURSQUARE_API_KEY,
                    "Accept": "application/json"
                },
                params: {
                    near: city,
                    limit: 10 
                }
            });

            const places = response.data.results;

            for (const place of places) {
                const newPlace = new Places({
                    fsq_id: place.fsq_id,
                    city: city,
                    name: place.name,
                    address: place.location.formatted_address || "Unknown Address",
                    latitude: place.geocodes.main.latitude,
                    longitude: place.geocodes.main.longitude,
                    categories: place.categories ? place.categories.map(cat => cat.name) : [],
                    reviews: [], 
                    photos: [] 
                });

                await newPlace.save();
                console.log(`Saved place: ${place.name} in ${city}`);
            }
        } catch (error) {
            console.error(`Error fetching data for ${city}:`, error.message);
        }
    }

    console.log("Finished fetching and storing all places.");
});

const fetchPhotosAndReviews = expressAsyncHandler(async (req, res) => {
    try {
      const places = await Places.find({}); // Get all places from MongoDB
  
      for (const place of places) {
        const { fsq_id } = place;
  
        // Fetch Photos
        const photoResponse = await axios.get(
          `https://api.foursquare.com/v3/places/${fsq_id}/photos`,
          { headers: { Authorization: `Bearer ${process.env.FOURSQUARE_API_KEY}` } }
        );
        const photos = photoResponse.data.map(
          (photo) => photo.prefix + "original" + photo.suffix
        );
  
        // Fetch Reviews
        const reviewResponse = await axios.get(
          `https://api.foursquare.com/v3/places/${fsq_id}/tips`,
          { headers: { Authorization: `Bearer ${process.env.FOURSQUARE_API_KEY}` } }
        );
        const reviews = reviewResponse.data.map((tip) => tip.text);
  
        // Update the Place document with Photos & Reviews
        await Places.updateOne({ fsq_id }, { $set: { photos, reviews } });
  
        console.log(`✅ Updated: ${place.name} with photos & reviews.`);
      }
  
      res.json({ message: "✅ Photos & reviews fetched successfully!" });
    } catch (error) {
      console.error("❌ Error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to fetch photos & reviews" });
    }
  });
  
  module.exports = { fetchAndStorePlaces, fetchPhotosAndReviews };
  