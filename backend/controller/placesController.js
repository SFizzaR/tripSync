const expressAsyncHandler = require("express-async-handler");
const axios = require("axios");
require("dotenv").config();
const jwt = require("jsonwebtoken"); 
const Places = require("../models/placesModel"); // Import the Places model
const UserRatings=require("../models/userRatingsModel");

const categoryMapping = {
  restaurant:["13065", "13377", "13298"],
  music: ["10039"],
  cafe:["13032", "13383"],
  hotel: ["19014"],
  shopping: ["17069", "17070"],
  attraction: ["10000", "12042"],
  nature: ["16011","16032"], // Handle plural case
  entertainment: ["19016", "10039","19046"],
  history: ["10030", "10027", "12003", "12106", "12108","10027"],
};

const getPlaces = expressAsyncHandler(async (req, res) => {
  let { city, filter } = req.query;

  if (!city) {
    return res.status(400).json({ message: "City is required" });
  }

  if (filter && !categoryMapping[filter.toLowerCase()]) {
    return res.status(400).json({ message: "Invalid category filter" });
  }

  try {
    const url = "https://api.foursquare.com/v3/places/search";
    let params = { near: city, limit: 50 };

    if (filter) {
      const categoryIds = categoryMapping[filter.toLowerCase()];
      if (categoryIds) {
        params.categories = categoryIds.join(",");
      }
    }

    console.log("Requesting Foursquare API with:", params);
    const response = await axios.get(url, {
      headers: { Authorization: process.env.FOURSQUARE_API.trim() },
      params: params,
    });

    let places = response.data.results || [];

    // ✅ Fix: Ensure `categories` exist before filtering
    if (filter) {
      places = places.filter((place) => 
        place.categories && // Ensure categories exist
        Array.isArray(place.categories) && // Ensure it's an array
        place.categories.some((cat) => 
          categoryMapping[filter.toLowerCase()]?.includes(String(cat.id))
        )
      );
    }

    if (places.length > 0) {
      res.json(places);
    }
  } catch (error) {
    console.error("❌ Foursquare API Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Server error", error: error.response?.data || error.message });
  }
});

const fetchWithRetry = async (url, options, retries = 3, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.get(url, { ...options, timeout: 10000 });
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(`Retrying request to ${url} (Attempt ${i + 1}/${retries})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

const getPlaceById = expressAsyncHandler(async (req, res) => {
  const { fsq_id } = req.params;
  try {
    let place = await Places.findOne({ fsq_id });
    if (!place) {
      const placeResponse = await fetchWithRetry(
        `https://api.foursquare.com/v3/places/${fsq_id}`,
        {
          headers: {
            Authorization: process.env.FOURSQUARE_API,
            Accept: "application/json",
          },
        }
      );
      const placeData = placeResponse.data;
      let photos = [];
      try {
        const photoResponse = await fetchWithRetry(
          `https://api.foursquare.com/v3/places/${fsq_id}/photos`,
          {
            headers: {
              Authorization: process.env.FOURSQUARE_API,
              Accept: "application/json",
            },
          }
        );
        photos = photoResponse.data.map(
          (photo) => photo.prefix + "original" + photo.suffix
        );
      } catch (photoError) {
        console.warn(`No photos found for fsq_id ${fsq_id}:`, photoError.response?.data || photoError.message);
      }
      let reviews = [];
      try {
        const reviewResponse = await fetchWithRetry(
          `https://api.foursquare.com/v3/places/${fsq_id}/tips`,
          {
            headers: {
              Authorization: process.env.FOURSQUARE_API,
              Accept: "application/json",
            },
          }
        );
        reviews = reviewResponse.data.map((tip) => tip.text);
      } catch (reviewError) {
        console.warn(`No reviews found for fsq_id ${fsq_id}:`, reviewError.response?.data || reviewError.message);
      }
      place = new Places({
        fsq_id: placeData.fsq_id,
        city: placeData.location?.locality || "Unknown City",
        name: placeData.name || "Unknown Place",
        address: placeData.location?.formatted_address || "Unknown Address",
        latitude: placeData.geocodes?.main?.latitude || null,
        longitude: placeData.geocodes?.main?.longitude || null,
        categories: placeData.categories
          ? placeData.categories.map((cat) => cat.name)
          : [],
        photos: photos || [],
        reviews: reviews || [],
      });
      await place.save();
      console.log(`Saved new place from Foursquare: ${place.name}`);
    }
    res.json(place);
  } catch (error) {
    console.error("Error fetching place by ID:", error.response?.data || error.message);
    if (error.response?.status === 404) {
      res.status(404).json({ message: "Place not found in Foursquare" });
    } else {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
});

const ratePlace = expressAsyncHandler(async (req, res) => {
  const { user_id, place_id, rating } = req.body;

  try {
      // Validate the place_id by fetching from Foursquare
      const foursquareResponse = await axios.get(
          `https://api.foursquare.com/v3/places/${place_id}`,
          {
              headers: {
                  Authorization: process.env.FOURSQUARE_API
              }
          }
      );

      const placeData = foursquareResponse.data;
      console.log('Foursquare place data:', JSON.stringify(placeData, null, 2));

      // Ensure name is provided
      const placeName = placeData.name || placeData.title || `Place_${place_id}`;
      if (!placeName) {
          throw new Error('Foursquare response missing valid name or title');
      }

      // Check if the place exists in the places collection
      const existingPlace = await Places.findOne({ fsq_id: place_id });
      if (!existingPlace) {
          const newPlace = new Places({
              fsq_id: place_id,
              name: placeName,
              city: placeData.location?.city || 'Unknown',
              categories: placeData.categories?.map(cat => cat.name) || ['Unknown'],
              address: placeData.location?.address || 'Unknown',
              latitude: placeData.geocodes?.main?.latitude || 0,
              longitude: placeData.geocodes?.main?.longitude || 0,
              reviews: [],
              photos: placeData.photos || []
          });
          await newPlace.save();
      }

      // Check for existing rating and update or insert
      const updatedRating = await UserRatings.findOneAndUpdate(
          { user_id, place_id },
          { 
              $set: { 
                  rating, 
                  updatedAt: new Date()
              } 
          },
          { 
              upsert: true,
              new: true
          }
      );

      res.status(201).json({ message: 'Rating saved successfully', rating: updatedRating });
  } catch (error) {
      console.error('Error saving rating:', error.message);
      res.status(500).json({ error: 'Failed to save rating' });
  }
});
const getUserRatings = expressAsyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET_TOKEN);
    if (decoded.user.id !== userId) {
      return res.status(403).json({ message: "Unauthorized user" });
    }

    const ratings = await UserRatings.find({ user_id: userId }).select('user_id place_id rating createdAt updatedAt');

    if (ratings.length > 0) {
      res.json(ratings);
    } else {
      res.status(404).json({ message: "No ratings found for this user" });
    }
  } catch (error) {
    console.error("Error fetching user ratings:", error.message);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


module.exports = { getPlaces,getPlaceById, ratePlace, getUserRatings};
