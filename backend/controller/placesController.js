const expressAsyncHandler = require("express-async-handler");
const axios = require("axios");
require("dotenv").config();

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
    } else {
      console.warn("⚠ No places found for filter:", filter);
      res.status(404).json({ message: "No places found for the selected category" });
    }
  } catch (error) {
    console.error("❌ Foursquare API Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Server error", error: error.response?.data || error.message });
  }
});

module.exports = { getPlaces };


/*

sahiii wala codeeee

const expressAsyncHandler = require("express-async-handler");
const axios = require("axios");
require("dotenv").config();

const categoryMapping = {
  restaurant: "13065",
  music: "10039",
  cafe: "13032",
  park: "16032",
  hotel: "19014",
  mall: "17069",
  museum: "10027",
  attraction: "10000",
  beach: "16011",
  zoo: "19046",
  cinema: "19016",
};

const getPlaces = expressAsyncHandler(async (req, res) => {
  const { city, filter } = req.query;

  if (!city) {
    return res.status(400).json({ message: "City is required" });
  }

  try {
    const url = "https://api.foursquare.com/v3/places/search";

    let params = {
      near: city, // Foursquare prefers 'near' over lat/lng
      limit: 50,
    };

    if (filter) {
      const categoryId = categoryMapping[filter.toLowerCase()];
      if (categoryId) {
        params.categories = categoryId; // Ensure it's a valid category
      }
    }

    console.log("Sending request to Foursquare with params:", params);

    const response = await axios.get(url, {
      headers: {
        Authorization: process.env.FOURSQUARE_API.trim(),
      },
      params: params,
    });

    if (response.data.results && response.data.results.length > 0) {
      res.json(response.data.results);
    } else {
      res.status(404).json({ message: "No places found" });
    }
  } catch (error) {
    console.error("Foursquare API Error:", error.response?.data || error.message);
    res.status(500).json({
      message: "Server error",
      error: error.response?.data || error.message,
    });
  }
});

module.exports = { getPlaces };
*/