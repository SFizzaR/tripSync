const expressAsyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const Itinerary = require("../models/ItinerariesModel");
const Place = require("../models/placesModel");
const { fetchCityFromCoordinates } = require('../utils/findCity');


const createItinerary = expressAsyncHandler(async (req, res) => {
  try {
    const { collaborative, status, city, startDate, endDate, budget,title } = req.body;
     
    console.log("Data recieved: ",req.body)

    // Validate status
    const validStatuses = ["planning", "in-progress", "complete"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    // Create itinerary with the logged-in user's ID
    const itinerary = new Itinerary({
      users: [req.user._id], // First user is the logged-in user
      admin: req.user._id,
      city,
      collaborative,
      status: status || "planning",
      startDate: startDate || null,
      endDate: endDate || null,
      budget: budget || null,
      title,
    });

    await itinerary.save();

    res.status(201).json(itinerary);
  } catch (error) {
    res.status(500).json({ message: "Error creating itinerary", error: error.message });
  }
});

const getSoloItineraries = expressAsyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const itineraries = await Itinerary.find({ users: userId })
      .select("_id title city status budget") 
      .lean();
 
    res.status(200).json(itineraries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching itineraries", error: error.message });
  }
});

const getColabItineraries = expressAsyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const itineraries = await Itinerary.find({ 
        users: userId,
      collaborative:true 
    })
      .select("_id title") 
      .lean();

    res.status(200).json(itineraries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching collaborative itineraries", error: error.message });
  }
});

const updateItinerary = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, status, startDate, endDate, budget } = req.body;

  try {
    // Validate dates
    let parsedStartDate = startDate ? new Date(startDate) : undefined;
    let parsedEndDate = endDate ? new Date(endDate) : undefined;

    if (parsedStartDate && isNaN(parsedStartDate.getTime())) {
      return res.status(400).json({ message: "Invalid start date format" });
    }

    if (parsedEndDate && isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({ message: "Invalid end date format" });
    }

    if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
      return res.status(400).json({ message: "Start date cannot be after end date" });
    }

    // Use findByIdAndUpdate to modify the document in one step
    const updatedItinerary = await Itinerary.findByIdAndUpdate(
      id,
      { title, status, startDate: parsedStartDate, endDate: parsedEndDate, budget },
      { new: true, runValidators: true } // Returns the updated document & enforces validation
    );

    if (!updatedItinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }

    res.json({ message: "Itinerary updated successfully", itinerary: updatedItinerary });
  } catch (error) {
    console.error("Error updating itinerary:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});


const addPlaceToItinerary = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { placeId } = req.body;

  try {
    const itinerary = await Itinerary.findById(id);
    if (!itinerary) return res.status(404).json({ message: "Itinerary not found" });

    const place = await Place.findById(placeId);
    if (!place) return res.status(404).json({ message: "Place not found" });


    const city = await fetchCityFromCoordinates(place.latitude, place.longitude)
    if (city.toLowerCase() !== itinerary.city.toLowerCase()) {
      return res.status(400).json({ message: `Place does not belong to ${itinerary.city}` })
    }
    if (!itinerary.places.includes(placeId)) {
      const updatedItinerary = await Itinerary.findByIdAndUpdate(
        id,
        {
          $addToSet: { places: placeId }
        },
        { new: true }
      );

      return res.json({ message: "Place added", itinerary: updatedItinerary });
    }

    res.json({ message: "Place already exists in the itinerary", itinerary });
  } catch (error) {
    console.error("Error adding place:", error);
    res.status(500).json({ message: "Error adding place", error: error.message });
  }
});


const addUserToItinerary = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  try {
    const itinerary = await Itinerary.findById(id);
    if (!itinerary) return res.status(404).json({ message: "Itinerary not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" })

    if (!itinerary.users.includes(userId)) {
      const updatedItinerary = await Itinerary.findByIdAndUpdate(
        id,
        { $addToSet: { users: userId } },
        { new: true }
      )
    }
    res.json({ message: "User added", itinerary });
  }
  catch (error) {
    res.status(500).json({ message: "Error finding user" });
  }
})


module.exports = { createItinerary, getSoloItineraries,getColabItineraries, updateItinerary, addPlaceToItinerary, addUserToItinerary };
