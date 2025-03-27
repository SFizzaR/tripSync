const expressAsyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const Itinerary = require("../models/ItinerariesModel");
const Place = require("../models/placesModel");
const axios = require("axios");


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
      collaborative : collaborative || false,
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

    const itineraries = await Itinerary.find({ 
      users: userId,
      collaborative: false
    })
      .lean(); // Fetches the full itinerary without field selection

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
      collaborative: true 
    })
      .lean(); // Fetches the full itinerary without field selection

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
  const { itineraryId, placeId } = req.params;
  const { placeName } = req.body; // ✅ Ensure this is received from frontend

  try {
    console.log("🔍 Received Request:", { itineraryId, placeId, placeName });

    if (!itineraryId || !placeId || !placeName) {
      return res.status(400).json({ message: "❌ Missing itineraryId, placeId, or placeName" });
    }

    // 🔹 Find the itinerary
    const itinerary = await Itinerary.findById(itineraryId);
    if (!itinerary) {
      return res.status(404).json({ message: "❌ Itinerary not found" });
    }

    // 🔹 Ensure `places` array exists
    if (!Array.isArray(itinerary.places)) {
      itinerary.places = [];
    }

    // 🔹 Check if place already exists
    if (itinerary.places.some((place) => place.placeId === placeId)) {
      return res.status(400).json({ message: "❌ Place already added" });
    }

    // 🔹 Add place correctly
    const newPlace = {
      placeId: placeId.toString(),  // ✅ Ensure string format
      placeName: placeName.trim(),  // ✅ Trim to avoid extra spaces
    };

    itinerary.places.push(newPlace);

    await itinerary.save();

    console.log("✅ Updated Itinerary:", itinerary);
    res.json({ message: "✅ Place added successfully", itinerary });
  } catch (error) {
    console.error("❌ Error adding place:", error.message);
    res.status(500).json({ message: "❌ Server error", error: error.message });
  }
});

const getItineraryPlaces = expressAsyncHandler(async (req, res) => {
  try {
    const { itineraryId } = req.params;
    const itinerary = await Itinerary.findById(itineraryId);

    if (!itinerary) {
      return res.status(404).json({ message: "❌ Itinerary not found" });
    }

    // 🔹 Ensure `places` exists
    if (!Array.isArray(itinerary.places)) {
      itinerary.places = []; // ✅ Initialize if missing
    }

    const placeNames = itinerary.places.map((place) => place.placeName);

    res.json({ placeNames });
  } catch (error) {
    console.error("❌ Error fetching places:", error.message);
    res.status(500).json({ message: "❌ Server error" });
  }
});

const addUserToItinerary = expressAsyncHandler(async (req, res) => {
  const { id, senderId, receiverId } = req.body; // Ensure correct spelling: receiverId

  try {
    const itinerary = await Itinerary.findById(id);
    if (!itinerary) return res.status(404).json({ message: "Itinerary not found" });

    const user = await User.findById(receiverId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!itinerary.users.includes(receiverId)) {
      const updatedItinerary = await Itinerary.findByIdAndUpdate(
        id,
        { $addToSet: { users: receiverId } }, // Use receiverId
        { new: true }
      );

      return res.json({ message: "User added", itinerary: updatedItinerary });
    }

    res.status(400).json({ message: "User is already in the itinerary" });
  } catch (error) {
    console.error("Error adding user to itinerary:", error);
    res.status(500).json({ message: "Server error" });
  }
});


const deleteUser = expressAsyncHandler(async (req, res) => {
  try {
    const loggedInUserId = req.user._id; // Logged-in user (admin or normal user)
    const { itineraryId, userId: targetUserId } = req.params; // Extract IDs

    const itinerary = await Itinerary.findById(itineraryId);
    if (!itinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }

    // Allow users to remove themselves OR admin to remove anyone
    const isAdmin = loggedInUserId.toString() === itinerary.admin.toString();
    const isSelf = loggedInUserId.toString() === targetUserId;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ message: "Access Denied: Only admin can remove others." });
    }

    if (!itinerary.users.includes(targetUserId)) {
      return res.status(404).json({ message: "User not found in itinerary." });
    }

    // Prevent the last user from deleting themselves
    if (itinerary.users.length === 1) {
      return res.status(403).json({ message: "Cannot remove the last user. Delete itinerary instead." });
    }

    // Remove user from the users array
    itinerary.users = itinerary.users.filter(u => u.toString() !== targetUserId);

    // If the admin is deleting themselves, assign a new admin
    if (targetUserId === itinerary.admin.toString() && itinerary.users.length > 0) {
      itinerary.admin = itinerary.users[0]; // First user becomes new admin
    }

    await itinerary.save();

    return res.status(200).json({ message: isSelf ? "You left the itinerary." : "User removed successfully", itinerary });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

const deletePlace = expressAsyncHandler(async (req, res) => {
  try {
    const { itineraryId, placeId: targetPlaceId } = req.params;


    // Fetch the itinerary
    const itinerary = await Itinerary.findById(itineraryId);
    if (!itinerary) {
      console.log("Itinerary not found");
      return res.status(404).json({ message: "Itinerary not found" });
    }

    console.log("Itinerary found:", itinerary);

    // Convert targetPlaceId to ObjectId if needed
    const targetPlaceObjectId = mongoose.Types.ObjectId.isValid(targetPlaceId)
      ? new mongoose.Types.ObjectId(targetPlaceId)
      : targetPlaceId;


    // Check if the place exists in the itinerary
    if (!itinerary.places.some(place => place.toString() === targetPlaceId)) {
      return res.status(404).json({ message: "Place not found in itinerary." });
    }


    // Remove the place from the itinerary
    const updatedItinerary = await Itinerary.findByIdAndUpdate(
      itineraryId,
      { $pull: { places: targetPlaceObjectId } },
      { new: true }
    );

    if (!updatedItinerary) {
      return res.status(404).json({ message: "Failed to delete place." });
    }


    return res.status(200).json({
      message: "Place deleted successfully",
      itinerary: updatedItinerary
    });

  } catch (error) {
    console.error("Error deleting place:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = { createItinerary, getSoloItineraries,getColabItineraries, updateItinerary, addPlaceToItinerary,getItineraryPlaces , addUserToItinerary, deleteUser, deletePlace };
