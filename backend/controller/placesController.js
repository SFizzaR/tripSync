const expressAsyncHandler = require("express-async-handler");
const axios = require("axios");
require("dotenv").config();

const categoryMapping = {
  restaurant: "13065",   // Restaurants
  music:"10039",
  cafe: "13032",         // Cafes
  park: "16032",         // Parks
  hotel: "19014",        // Hotels
  mall: "17069",         // Shopping Malls
  museum: "10027",       // Museums
  attraction: "10000",   // General Attractions
  beach: "16011",        // Beaches
  zoo: "19046",          // Zoos
  cinema: "19016",       // Cinemas
};

const getPlaces = expressAsyncHandler(async (req, res) => {
  const { city, filter } = req.query;

  if (!city) {
    return res.status(400).json({ message: "City is required" });
  }

  try {
    const url = "https://api.foursquare.com/v3/places/search";

    const params = {
      near: city,
      limit: 50,
    };

    if (filter) {
      const categoryId = categoryMapping[filter.toLowerCase()];
      if (categoryId) {
        params.categories = categoryId.toString(); // Use category ID for filtering
      }
    }

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
    console.error("Error with Foursquare API:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = { getPlaces };


/*
const expressAsyncHandler = require("express-async-handler");
const axios = require("axios");
require("dotenv").config();

//FOURSQUARE_API='fsq3kPHD7I0QVpqXg6ENkf1tD6eUkDvQI0EZ8XohpEMOeEw='

const getPlaces = expressAsyncHandler(async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ message: "City is required" });
  }

  try {
    const url = `https://api.foursquare.com/v3/places/search?near=${city}`;

    const options = {
      headers: {
        Authorization: ` ${process.env.FOURSQUARE_API}`,
      },
    };

    const { data } = await axios.get(url, options);

    res.json(data.results);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = { getPlaces };
*/
