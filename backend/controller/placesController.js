const expressAsyncHandler = require("express-async-handler");
const axios = require("axios");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const Places = require("../models/placesModel");
const UserRatings = require("../models/userRatingsModel");
const fsqSdk = require("../.api/apis/fsq-developers-places");

fsqSdk.auth(process.env.FOURSQUARE_API?.trim());

// ✅ Complete category mapping based on official Foursquare taxonomy
const categoryMapping = {
  restaurant: [
    "4bf58dd8d48988d1ce941735", // Italian Restaurant
    "4bf58dd8d48988d1d0941735", // Steakhouse
    "4bf58dd8d48988d10e941735", // Greek Restaurant
    "53d6c1b0e4b02351e88a83d4", // Modern Greek Restaurant
    "4bf58dd8d48988d1d1941735", // Mediterranean Restaurant
    "4bf58dd8d48988d1d3941735", // Seafood Restaurant
    "4bf58dd8d48988d14f941735", // Chinese Restaurant
    "4bf58dd8d48988d1d2941735", // Japanese Restaurant
    "4bf58dd8d48988d1cf941735", // Thai Restaurant
    "4bf58dd8d48988d1d4941735", // Vietnamese Restaurant
    "4bf58dd8d48988d1d5941735", // Korean Restaurant
    "4bf58dd8d48988d1d6941735", // Indian Restaurant
    "4bf58dd8d48988d16c941735", // American Restaurant
    "4bf58dd8d48988d1d7941735", // BBQ Joint
    "4bf58dd8d48988d1d8941735", // Mexican Restaurant
    "4bf58dd8d48988d1d9941735", // Brazilian Restaurant
    "4bf58dd8d48988d1da941735", // Argentine Restaurant
    "4bf58dd8d48988d1db941735", // Peruvian Restaurant
    "4bf58dd8d48988d1dc941735", // French Restaurant
    "4bf58dd8d48988d1dd941735", // Turkish Restaurant
    "4bf58dd8d48988d1de941735", // Spanish Restaurant
    "4bf58dd8d48988d1df941735", // Lebanese Restaurant
    "4bf58dd8d48988d1e0941735", // Portuguese Restaurant
    "4bf58dd8d48988d1e1941735", // Hungarian Restaurant
    "4bf58dd8d48988d1e2941735", // Burger Joint
    "4bf58dd8d48988d1e3941735", // Sandwich Shop
    "4bf58dd8d48988d1e4941735", // Pizza Place
    "4bf58dd8d48988d1e5941735", // Ramen Restaurant
    "4bf58dd8d48988d1e6941735", // Sushi Restaurant
    "4bf58dd8d48988d1e7941735", // Taco Place
    "4bf58dd8d48988d1e8941735", // Hot Dog Shop
    "4bf58dd8d48988d1e9941735", // Noodle House
    "4bf58dd8d48988d1ea941735", // Diner
    "4bf58dd8d48988d1eb941735", // Fast Food Restaurant
    "4bf58dd8d48988d1ec941735", // Food Court
    "4bf58dd8d48988d1ed941735", // Café
    "4bf58dd8d48988d1ee941735", // Falafel Restaurant
    "4bf58dd8d48988d1ef941735", // Filipino Restaurant
  ],
  cafe: [
    "4bf58dd8d48988d16a941735", // Coffee Shop
    "4bf58dd8d48988d16b941735", // Café
    "4bf58dd8d48988d16c941735", // Tea Room
    "4bf58dd8d48988d16d941735", // Bakery
    "4bf58dd8d48988d16e941735", // Dessert Shop
    "4bf58dd8d48988d16f941735", // Donut Shop
    "4bf58dd8d48988d170941735", // Juice Bar
    "4bf58dd8d48988d171941735", // Creperie
  ],
  shopping: [
    "4bf58dd8d48988d1f0941735", // Shopping Mall
    "4bf58dd8d48988d1f1941735", // Shopping Center
    "4bf58dd8d48988d1f2941735", // Bookstore
    "4bf58dd8d48988d1f3941735", // Record Shop
    "4bf58dd8d48988d1f4941735", // Video Game Store
    "4bf58dd8d48988d1f5941735", // Clothing Store
    "4bf58dd8d48988d1f6941735", // Shoe Store
    "4bf58dd8d48988d1f7941735", // Fashion Store
    "4bf58dd8d48988d1f8941735", // Jewelry Store
    "4bf58dd8d48988d1f9941735", // Accessory Store
    "4bf58dd8d48988d1fa941735", // Home Goods Store
    "4bf58dd8d48988d1fb941735", // Garden Center
    "4bf58dd8d48988d1fc941735", // Furniture Store
    "4bf58dd8d48988d1fd941735", // Hardware Store
    "4bf58dd8d48988d1fe941735", // Home Improvement Store
    "4bf58dd8d48988d1ff941735", // Electronics Store
    "4bf58dd8d48988d200941735", // Computer Store
    "4bf58dd8d48988d201941735", // Wireless Store
    "4bf58dd8d48988d202941735", // Sports Store
    "4bf58dd8d48988d203941735", // Sporting Goods Store
    "4bf58dd8d48988d204941735", // Outdoor Store
    "4bf58dd8d48988d205941735", // Bicycle Store
    "4bf58dd8d48988d206941735", // Beauty Supply Store
    "4bf58dd8d48988d207941735", // Cosmetics Store
    "4bf58dd8d48988d208941735", // Pharmacy
    "4bf58dd8d48988d209941735", // Health Store
    "4bf58dd8d48988d20a941735", // Grocery Store
    "4bf58dd8d48988d20b941735", // Supermarket
    "4bf58dd8d48988d20c941735", // Farmers Market
    "4bf58dd8d48988d20d941735", // Food Market
    "4bf58dd8d48988d20e941735", // Specialty Market
    "4bf58dd8d48988d20f941735", // Flower Shop
    "4bf58dd8d48988d210941735", // Gift Shop
    "4bf58dd8d48988d211941735", // Toy Store
    "4bf58dd8d48988d212941735", // Thrift Store
    "4bf58dd8d48988d213941735", // Antique Store
    "4bf58dd8d48988d214941735", // Flea Market
  ],
  hotel: [
    "4bf58dd8d48988d1f8931735", // Bed and Breakfast
    "4bf58dd8d48988d1fa931735", // Hostel
    "4bf58dd8d48988d1fb931735", // Hotel
    "4bf58dd8d48988d1fc931735", // Motel
    "4bf58dd8d48988d12f951735", // Resort
    "5bae9231bedf3950379f89cb", // Inn
    "4f4530a74b9074f6e4fb0100", // Boarding House
    "63be6904847c3692a84b9c26", // Cabin
    "63be6904847c3692a84b9c27", // Lodge
    "56aa371be4b08b9a8d5734e1", // Vacation Rental
  ],
  music: [
    "4bf58dd8d48988d1e5931735", // Music Venue
    "5032792091d4c4b30a586d5c", // Concert Hall
    "4bf58dd8d48988d1e7931735", // Jazz and Blues Venue
    "4bf58dd8d48988d1e9931735", // Rock Club
    "4bf58dd8d48988d18e941735", // Comedy Club
    "5744ccdfe4b0c0459246b4b8", // Karaoke Box
    "4bf58dd8d48988d11f941735", // Night Club
    "4bf58dd8d48988d136941735", // Opera House
    "52e81612bcbc57f1066b79ef", // Country Dance Club
    "52e81612bcbc57f1066b79f0", // Salsa Club
  ],
  attraction: [
    "4bf58dd8d48988d181941735", // Museum
    "4bf58dd8d48988d18f941735", // Art Museum
    "4bf58dd8d48988d191941735", // Science Museum
    "559acbe0498e472f1a53fa23", // Erotic Museum
    "4bf58dd8d48988d137941735", // Theater
    "4bf58dd8d48988d135941735", // Indie Theater
    "4bf58dd8d48988d17e941735", // Indie Movie Theater
    "4bf58dd8d48988d17f941735", // Movie Theater
    "4bf58dd8d48988d180941735", // Multiplex
    "56aa371be4b08b9a8d5734de", // Drive-in Theater
    "4bf58dd8d48988d182941735", // Amusement Park
    "4bf58dd8d48988d193941735", // Water Park
    "4bf58dd8d48988d192941735", // Planetarium
    "4fceea171983d5d06c3e9823", // Aquarium
    "4bf58dd8d48988d172941735", // Zoo
    "58daa1558bbb0b01f18ec1fd", // Zoo Exhibit
    "4bf58dd8d48988d1e1931735", // Arcade
    "4bf58dd8d48988d1e4931735", // Bowling Alley
    "52e81612bcbc57f1066b79eb", // Mini Golf Course
    "52e81612bcbc57f1066b79ea", // Go Kart Track
    "5f2c2834b6d05514c704451e", // Escape Room
    "507c8c4091d498d9fc8c67a9", // Public Art
    "4bf58dd8d48988d184941735", // Stadium
  ],
  nature: [
    "4bf58dd8d48988d10c941735", // Park
    "4bf58dd8d48988d10d941735", // Nature Preserve
    "4bf58dd8d48988d10e941735", // Botanical Garden
    "4bf58dd8d48988d10f941735", // Dog Park
    "4bf58dd8d48988d110941735", // Playground
    "4bf58dd8d48988d111941735", // Beach
    "4bf58dd8d48988d112941735", // Lake
    "4bf58dd8d48988d113941735", // River
    "4bf58dd8d48988d114941735", // Waterfall
    "52e81612bcbc57f1066b79ed", // Outdoor Sculpture
    "4eb1bf013b7b6f98df247df0", // Hiking Area
    "4bf58dd8d48988d115941735", // Jogging Track
    "4bf58dd8d48988d116941735", // Bike Trail
    "52e81612bcbc57f1066b79e8", // Disc Golf
    "63be6904847c3692a84b9c03", // Disc Golf Course
    "52e81612bcbc57f1066b79e9", // Roller Rink
  ],
  entertainment: [
    "4bf58dd8d48988d11f941735", // Night Club
    "4bf58dd8d48988d140941735", // Bar
    "4bf58dd8d48988d141941735", // Cocktail Bar
    "4bf58dd8d48988d142941735", // Wine Bar
    "4bf58dd8d48988d143941735", // Pub
    "4bf58dd8d48988d144941735", // Dive Bar
    "4bf58dd8d48988d145941735", // Lounge
    "52e81612bcbc57f1066b79ef", // Country Dance Club
    "52e81612bcbc57f1066b79f0", // Salsa Club
    "56aa371be4b08b9a8d5734f9", // Samba School
    "4bf58dd8d48988d1e5931735", // Music Venue
    "5032792091d4c4b30a586d5c", // Concert Hall
    "4bf58dd8d48988d18e941735", // Comedy Club
    "4bf58dd8d48988d1e1931735", // Arcade
    "4bf58dd8d48988d1e4931735", // Bowling Alley
    "4bf58dd8d48988d1e3931735", // Pool Hall
    "52e81612bcbc57f1066b79e6", // Laser Tag Center
    "5f2c2834b6d05514c704451e", // Escape Room
    "4bf58dd8d48988d17f941735", // Movie Theater
  ],
  history: [
    "4bf58dd8d48988d12b941735", // Historic Site
    "4bf58dd8d48988d12c941735", // Monument
    "4bf58dd8d48988d12d941735", // Archaeological Site
    "4bf58dd8d48988d12e941735", // Ancient Ruins
    "4bf58dd8d48988d12f941735", // Building
    "4bf58dd8d48988d130941735", // Castle
    "4bf58dd8d48988d131941735", // Palace
    "4bf58dd8d48988d132941735", // Temple
    "4bf58dd8d48988d133941735", // Church
    "4bf58dd8d48988d134941735", // Mosque
    "4bf58dd8d48988d135941735", // Synagogue
    "4bf58dd8d48988d136941735", // Shrine
    "4bf58dd8d48988d190941735", // History Museum
    "52e81612bcbc57f1066b7a09", // Library
    "507c8c4091d498d9fc8c67a9", // Public Art
    "56aa371be4b08b9a8d5734db", // Amphitheater
  ],
};

const getPlaces = expressAsyncHandler(async (req, res) => {
  let { city, filter } = req.query;

  console.log("📝 getPlaces request:", { city, filter });

  if (!city) {
    console.error("❌ Missing city parameter");
    return res.status(400).json({ message: "City is required" });
  }

  if (filter && !categoryMapping[filter.toLowerCase()]) {
    console.error("❌ Invalid filter:", filter);
    return res.status(400).json({ message: "Invalid category filter" });
  }

  try {
    // ✅ CHANGE: Get ALL places without category filter
    // We'll filter client-side instead to avoid SDK parameter issues
    const sdkParams = {
      near: city,
      limit: 50,
    };

    console.log("📤 Requesting Foursquare API with:", sdkParams);
    const response = await fsqSdk.placeSearch(sdkParams);
    
    let places = response.data?.results || response?.results || [];
    console.log(`✅ Got ${places.length} places from Foursquare`);

    // ✅ NEW: Filter client-side by checking fsq_category_id in the response
    if (filter) {
      const filterCategoryIds = categoryMapping[filter.toLowerCase()];
      console.log(`🔍 Filtering by ${filter}, looking for category IDs:`, filterCategoryIds);

      const beforeFilter = places.length;
      places = places.filter((place) => {
        // Check if place has categories
        if (!place.categories || !Array.isArray(place.categories)) {
          return false;
        }

        // Check if any of the place's category IDs match our filter
        const hasMatchingCategory = place.categories.some((cat) =>
          filterCategoryIds.includes(cat.fsq_category_id)
        );

        return hasMatchingCategory;
      });

      console.log(
        `✅ Filtered from ${beforeFilter} to ${places.length} places for category: ${filter}`
      );
      console.log(`📊 Sample categories from results:`, 
        places.slice(0, 2).map(p => ({
          name: p.name,
          categories: p.categories?.map(c => ({ id: c.fsq_category_id, name: c.name }))
        }))
      );
    }

    if (places.length === 0) {
      console.warn(`⚠️ No places found for city: ${city}, filter: ${filter}`);
    }

    console.log(`📤 Returning ${places.length} places to client`);
    res.json(places);
  } catch (error) {
    console.error("❌ Fatal error in getPlaces:");
    console.error("   Message:", error.message);
    console.error("   Status:", error.response?.status);
    console.error("   Data:", error.response?.data);
    console.error("   Stack:", error.stack);

    res.status(500).json({
      message: "Server error fetching places",
      error: error.response?.data || error.message,
    });
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
        console.warn(
          `No photos found for fsq_id ${fsq_id}:`,
          photoError.response?.data || photoError.message
        );
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
        console.warn(
          `No reviews found for fsq_id ${fsq_id}:`,
          reviewError.response?.data || reviewError.message
        );
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

  if (!user_id || !place_id || rating === undefined) {
    return res.status(400).json({
      message: "user_id, place_id, and rating are required",
    });
  }

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return res.status(400).json({
      message: "rating must be a number between 1 and 5",
    });
  }

  if (!process.env.FOURSQUARE_API) {
    return res.status(500).json({
      message: "Foursquare API key is not configured",
    });
  }

  try {
    // Validate the place_id by fetching from Foursquare using the generated SDK
    const foursquareResponse = await fsqSdk.placeDetails({
      fsq_place_id: place_id,
    });
    const placeData = foursquareResponse.data;
    console.log(
      "Foursquare place data:",
      JSON.stringify(placeData, null, 2)
    );

    // Ensure name is provided
    const placeName = placeData.name || placeData.title || `Place_${place_id}`;
    if (!placeName) {
      throw new Error("Foursquare response missing valid name or title");
    }

    // Check if the place exists in the places collection
    const existingPlace = await Places.findOne({ fsq_id: place_id });
    if (!existingPlace) {
      const newPlace = new Places({
        fsq_id: place_id,
        name: placeName,
        city: placeData.location?.city || "Unknown",
        categories: placeData.categories?.map((cat) => cat.name) || ["Unknown"],
        address: placeData.location?.address || "Unknown",
        latitude: placeData.geocodes?.main?.latitude || 0,
        longitude: placeData.geocodes?.main?.longitude || 0,
        reviews: [],
        photos: placeData.photos || [],
      });
      await newPlace.save();
    }

    // Check for existing rating and update or insert
    const updatedRating = await UserRatings.findOneAndUpdate(
      { user_id, place_id },
      {
        $set: {
          rating,
          updatedAt: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    res.status(201).json({
      message: "Rating saved successfully",
      rating: updatedRating,
    });
  } catch (error) {
    console.error(
      "Error saving rating:",
      error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({
      message: "Failed to save rating",
      details: error.response?.data || error.message,
    });
  }
});

const getUserRatings = expressAsyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET_TOKEN);
    if (decoded.user.id !== userId) {
      return res.status(403).json({ message: "Unauthorized user" });
    }

    const ratings = await UserRatings.find({ user_id: userId }).select(
      "user_id place_id rating createdAt updatedAt"
    );

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

module.exports = { getPlaces, getPlaceById, ratePlace, getUserRatings };