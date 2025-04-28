const expressAsyncHandler = require("express-async-handler");
const dotenv = require("dotenv").config();
const Places = require("../models/placesModel");
const axios = require("axios");

FOURSQUARE_API=process.env.FOURSQUARE_API;
const cities = [
  { city: "Abu Dhabi", country: "UAE" },
  { city: "Agra", country: "India" },
  { city: "Amsterdam", country: "Netherlands" },
  { city: "Athens", country: "Greece" },
  { city: "Auckland", country: "New Zealand" },
  { city: "Bali", country: "Indonesia" },
  { city: "Bangkok", country: "Thailand" },
  { city: "Barcelona", country: "Spain" },
  { city: "Beijing", country: "China" },
  { city: "Berlin", country: "Germany" },
  { city: "Cairo", country: "Egypt" },
  { city: "Cape Town", country: "South Africa" },
  { city: "Dubai", country: "UAE" },
  { city: "Dublin", country: "Ireland" },
  { city: "Florence", country: "Italy" },
  { city: "Hanoi", country: "Vietnam" },
  { city: "Hong Kong", country: "China" },
  { city: "Istanbul", country: "Turkey" },
  { city: "Jakarta", country: "Indonesia" },
  { city: "Kuala Lumpur", country: "Malaysia" },
  { city: "Kyoto", country: "Japan" },
  { city: "Lisbon", country: "Portugal" },
  { city: "London", country: "UK" },
  { city: "Los Angeles", country: "USA" },
  { city: "Madrid", country: "Spain" },
  { city: "Manila", country: "Philippines" },
  { city: "Melbourne", country: "Australia" },
  { city: "Moscow", country: "Russia" },
  { city: "Munich", country: "Germany" },
  { city: "New Delhi", country: "India" },
  { city: "New York", country: "USA" },
  { city: "Osaka", country: "Japan" },
  { city: "Paris", country: "France" },
  { city: "Prague", country: "Czech Republic" },
  { city: "Rio de Janeiro", country: "Brazil" },
  { city: "Rome", country: "Italy" },
  { city: "Seoul", country: "South Korea" },
  { city: "Shanghai", country: "China" },
  { city: "Singapore", country: "Singapore" },
  { city: "Sydney", country: "Australia" },
  { city: "Tokyo", country: "Japan" },
  { city: "Toronto", country: "Canada" },
  { city: "Venice", country: "Italy" },
  { city: "Vienna", country: "Austria" },
  { city: "Warsaw", country: "Poland" },
];

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

const fetchAndStorePlaces = expressAsyncHandler(async (req, res) => {
  const { city } = req.query;
  if (!city) {
    return res.status(400).json({ message: "City is required" });
  }

  try {
    const existingPlaces = await Places.find({ city });
    if (existingPlaces.length > 0) {
      console.log(`Places for ${city} already exist in MongoDB`);
      return res.json(existingPlaces);
    }

    const response = await fetchWithRetry(
      `https://api.foursquare.com/v3/places/search?near=${encodeURIComponent(city)}&limit=50`,
      {
        headers: {
          Authorization:FOURSQUARE_API,
          Accept: "application/json",
        },
      }
    );

    const placesData = response.data.results;
    if (!placesData || placesData.length === 0) {
      return res.status(404).json({ message: `No places found for ${city}` });
    }

    const places = [];
    for (const placeData of placesData) {
      const fsq_id = placeData.fsq_id;
      if (!fsq_id) {
        console.warn(`Skipping place ${placeData.name}: No fsq_id`);
        continue;
      }

      let place = await Places.findOne({ fsq_id });
      if (place) {
        places.push(place);
        continue;
      }

      let photos = [];
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const photoResponse = await fetchWithRetry(
          `https://api.foursquare.com/v3/places/${fsq_id}/photos`,
          {
            headers: {
              Authorization: FOURSQUARE_API,
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
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const reviewResponse = await fetchWithRetry(
          `https://api.foursquare.com/v3/places/${fsq_id}/tips`,
          {
            headers: {
              Authorization: FOURSQUARE_API,
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
        city: placeData.location?.locality || city,
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
      console.log(`Saved new place: ${place.name} in ${city}`);
      places.push(place);
    }

    res.json(places);
  } catch (error) {
    console.error("Error fetching/storing places:", error.response?.data || error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

const fetchPhotosAndReviews = expressAsyncHandler(async (req, res) => {
  try {
    const places = await Places.find({});
    for (const place of places) {
      const { fsq_id } = place;
      if (!fsq_id) {
        console.warn(`Skipping place ${place.name}: No fsq_id`);
        continue;
      }
      console.log(`Processing place: ${place.name}, fsq_id: ${fsq_id}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const photoResponse = await fetchWithRetry(
        `https://api.foursquare.com/v3/places/${fsq_id}/photos`,
        { headers: { Authorization: FOURSQUARE_API, Accept: "application/json" } }
      );
      const photos = photoResponse.data.map(
        (photo) => photo.prefix + "original" + photo.suffix
      );
      const reviewResponse = await fetchWithRetry(
        `https://api.foursquare.com/v3/places/${fsq_id}/tips`,
        { headers: { Authorization: FOURSQUARE_API, Accept: "application/json" } }
      );
      const reviews = reviewResponse.data.map((tip) => tip.text);
      await Places.updateOne({ fsq_id }, { $set: { photos, reviews } });
      console.log(`✅ Updated: ${place.name} with photos & reviews.`);
    }
    res.json({ message: "✅ Photos & reviews fetched successfully!" });
  } catch (error) {
    console.error("❌ Error fetching photos/reviews:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    res.status(500).json({ error: "Failed to fetch photos & reviews", details: error.message });
  }
});

const fetchPlacesForAllCities = expressAsyncHandler(async (req, res) => {
  try {
    for (const city of CITIES) {
      console.log(`Fetching places for city: ${city}`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const existingPlaces = await Places.find({ city });
      if (existingPlaces.length > 0) {
        console.log(`Places for ${city} already exist in MongoDB`);
        continue;
      }

      const response = await fetchWithRetry(
        `https://api.foursquare.com/v3/places/search?near=${encodeURIComponent(city)}&limit=50`,
        {
          headers: {
            Authorization: FOURSQUARE_API,
            Accept: "application/json",
          },
        }
      );

      const placesData = response.data.results;
      if (!placesData || placesData.length === 0) {
        console.warn(`No places found for ${city}`);
        continue;
      }

      for (const placeData of placesData) {
        const fsq_id = placeData.fsq_id;
        if (!fsq_id) {
          console.warn(`Skipping place ${placeData.name}: No fsq_id`);
          continue;
        }

        let place = await Places.findOne({ fsq_id });
        if (place) {
          continue;
        }

        let photos = [];
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const photoResponse = await fetchWithRetry(
            `https://api.foursquare.com/v3/places/${fsq_id}/photos`,
            {
              headers: {
                Authorization: FOURSQUARE_API,
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
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const reviewResponse = await fetchWithRetry(
            `https://api.foursquare.com/v3/places/${fsq_id}/tips`,
            {
              headers: {
                Authorization: FOURSQUARE_API,
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
          city: placeData.location?.locality || city,
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
        console.log(`Saved new place: ${place.name} in ${city}`);
      }
    }

    res.json({ message: "Places fetched and stored for all cities" });
  } catch (error) {
    console.error("Error fetching places for all cities:", error.response?.data || error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = { fetchAndStorePlaces, fetchPhotosAndReviews, fetchPlacesForAllCities }