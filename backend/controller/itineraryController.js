const expressAsyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const Itinerary = require("../models/ItinerariesModel");
const Place = require("../models/placesModel");
const axios = require("axios");
const mongoose = require("mongoose");

const createItinerary = expressAsyncHandler(async (req, res) => {
  try {
    const { collaborative, status, city, startDate, endDate, budget, title } = req.body;

    console.log("Data recieved: ", req.body)

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
      collaborative: collaborative || false,
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
    const loggedInUserId = req.user._id;
    const { itineraryId, userId: targetUserId } = req.params;

    const itinerary = await Itinerary.findById(itineraryId);
    if (!itinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }

    const isAdmin = loggedInUserId.toString() === itinerary.admin.toString();
    const isSelf = loggedInUserId.toString() === targetUserId;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ message: "Access Denied: Only admin can remove others." });
    }

    if (!itinerary.users.map(u => u.toString()).includes(targetUserId)) {
      return res.status(404).json({ message: "User not found in itinerary." });
    }

    if (itinerary.users.length === 1) {
      return res.status(403).json({ message: "Cannot remove the last user. Delete itinerary instead." });
    }

    // Remove user
    await Itinerary.findByIdAndUpdate(
      itineraryId,
      { $pull: { users: targetUserId } }
    );

    // Reload updated itinerary
    const updatedItinerary = await Itinerary.findById(itineraryId);

    // Reassign admin if needed
    if (targetUserId === itinerary.admin.toString() && updatedItinerary.users.length > 0) {
      updatedItinerary.admin = updatedItinerary.users[0]; // Assign new admin
      await updatedItinerary.save();
    }

    return res.status(200).json({
      message: isSelf ? "You left the itinerary." : "User removed successfully",
      itinerary: updatedItinerary,
    });
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

    // Check if the place exists in the itinerary
    if (!itinerary.places.some((place) => place.placeId === targetPlaceId)) {
      return res.status(404).json({ message: "Place not found in itinerary." });
    }

    // Remove the place from the itinerary
    const updatedItinerary = await Itinerary.findByIdAndUpdate(
      itineraryId,
      { $pull: { places: { placeId: targetPlaceId } } }, // ✅ Match placeId field
      { new: true }
    );

    if (!updatedItinerary) {
      return res.status(404).json({ message: "Failed to delete place." });
    }

    return res.status(200).json({
      message: "Place deleted successfully",
      itinerary: updatedItinerary,
    });
  } catch (error) {
    console.error("Error deleting place:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

const getColabUsers = expressAsyncHandler(async (req, res) => {
  try {
    const { itineraryId } = req.params;
    const currentUserId = req.user._id.toString();

    const itinerary = await Itinerary.findById(itineraryId);
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    if (!itinerary.collaborative) {
      return res.status(403).json({ message: 'Itinerary is not collaborative' });
    }

    // Combine admin and users (avoid duplication)
    const allUserIds = new Set([
      itinerary.admin.toString(),
      ...itinerary.users.map(id => id.toString())
    ]);

    // Include current user if not already present
    allUserIds.add(currentUserId);

    const users = await User.find({ _id: { $in: Array.from(allUserIds) } }).select('username');

    const collaborators = users.map(user => ({
      _id: user._id,
      username: user.username,
      role: user._id.toString() === itinerary.admin.toString() ? 'admin' : 'collaborator',
      isYou: user._id.toString() === currentUserId
    }));

    const isAdmin = itinerary.admin.toString() === currentUserId;

    return res.status(200).json({
      collaborators,
      message: isAdmin ? 'You are the admin of this itinerary' : 'Collaborators list',
      isAdmin
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

const deleteItinerary = expressAsyncHandler(async (req, res) => {
  try {
    const itineraryId = req.params.itineraryId;
    const userId = req.user._id;

    const itinerary = await Itinerary.findById(itineraryId);

    if (!itinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }

    if (userId.toString() !== itinerary.admin.toString()) {
      return res.status(403).json({ message: "Access Denied: Only admin can delete itineraries." });
    }

    await Itinerary.deleteOne({ _id: itineraryId });

    res.status(200).json({ message: "Itinerary deleted successfully" });
  } catch (error) {
    console.error("Error deleting itinerary:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const getUserCalendarItineraries = expressAsyncHandler(async (req, res) => {
  try {
    const userId = req.user._id; 

    const itineraries = await Itinerary.find({ users: userId })
      .select("startDate endDate title city");

    const calendarEvents = itineraries.map(it => ({
      title: it.title,
      start: it.startDate,
      end: it.endDate,
      city: it.city,
      id: it._id
    }));

    res.status(200).json(calendarEvents);
  } catch (error) {
    console.error("Error fetching calendar itineraries:", error);
    res.status(500).json({ message: "Server error" });
  }
});

const getInProgressAndUpcoming = expressAsyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const itineraries = await Itinerary.find({
      users: userId,
      endDate: { $gte: currentDate },

    }).select('startDate title city _id endDate');
    if (!itineraries || itineraries.length === 0) {
      console.log(`No in progress itineraries found for user ${userId}`);
      return res.status(200).json([]);
    }

    const inProgress = itineraries.map((itinerary) => ({
      itineraryId: itinerary._id,
      startDate: itinerary.startDate,
      title: itinerary.title,
      city: itinerary.city,
      endDate: itinerary.endDate
    }));

    console.log(`Found ${inProgress.length} in progress itineraries for user ${userId}`);
    res.status(200).json(inProgress);
  } catch (error) {
    console.error('Error fetching in progress itineraries:', error.message);
    res.status(500).json({ message: 'Failed to fetch in progress itineraries ', error: error.message });
  }


module.exports = { createItinerary, getSoloItineraries, getColabItineraries, updateItinerary, addPlaceToItinerary, getItineraryPlaces, addUserToItinerary, deleteUser, deletePlace, getColabUsers, deleteItinerary, getUserCalendarItineraries, getInProgressAndUpcoming };

