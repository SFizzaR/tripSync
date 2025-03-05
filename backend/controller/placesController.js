const expressAsyncHandler = require("express-async-handler");
const placesModel = require("../models/placesModel");
const { getCoordinates, getDistance } = require("../utils/geocoding");

const getPlaces = expressAsyncHandler(async (req, res) => {
    const { search } = req.query;

    if (!search) {
        return res.status(400).json({ message: "Search query is required" });
    }

    try {
        let places = await placesModel.find({}); // Fetch all places once
        let filteredPlaces = [];

        // 🔹 Step 1: Try Geolocation Search
        const cityCoordinates = await getCoordinates(search);
        console.log("City Coordinates:", cityCoordinates);

        if (cityCoordinates?.lat && cityCoordinates?.lng) {
            const radiusInKm = 10;
            filteredPlaces = places.filter(place => {
                const distance = getDistance(
                    cityCoordinates.lat, cityCoordinates.lng,
                    place.latitude, place.longitude
                );
                return distance <= radiusInKm;
            });
        }

        // 🔹 Step 2: Always Do Name/Category Search (Even if City is Found)
        const query = {
            $or: [
                { name: { $regex: search, $options: "i" } },
                { categories: { $regex: search, $options: "i" } }
            ]
        };
        console.log("Search Query:", search);
        console.log("MongoDB Query:", JSON.stringify(query, null, 2));

        const nameCategoryMatches = await placesModel.find(query);

        // 🔹 Step 3: Combine Both Results (Avoid Duplicates)
        const resultSet = new Map(); // Using Map to ensure uniqueness
        [...filteredPlaces, ...nameCategoryMatches].forEach(place => {
            resultSet.set(place._id.toString(), place);
        });

        // 🔹 Step 4: Send Response
        res.json([...resultSet.values()].length > 0 ? [...resultSet.values()] : { message: "No places found" });

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = { getPlaces };
