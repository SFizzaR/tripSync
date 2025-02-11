const expressAsyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const Itinerary = require("../models/ItinerariesModel");

const createItinerary = expressAsyncHandler(async (req, res) => {
  try {
    const { collaborative, status, city, startDate, endDate, budget } = req.body;


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
      budget: budget || null     
    });

    await itinerary.save();

    res.status(201).json(itinerary);
  } catch (error) {
    res.status(500).json({ message: "Error creating itinerary", error: error.message });
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
  const { id } = req.params; // Itinerary ID
  const { placeId } = req.body; 

  try {
      const itinerary = await Itinerary.findById(id);
      if (!itinerary) return res.status(404).json({ message: "Itinerary not found" });

      const place = await Place.findById(placeId);
      if (!place) return res.status(404).json({ message: "Place not found" });

      // Ensure the place belongs to the same city as the itinerary
      if (place.city !== itinerary.city) {
          return res.status(400).json({ message: "Place does not belong to the itinerary's city" });
      }

      if (!itinerary.places.includes(placeId)) {
          itinerary.places.push(placeId);

          // If it's the first place, set title as city name
          if (itinerary.places.length === 1) {
              itinerary.title = itinerary.city; // Use itinerary's city
          }

          await itinerary.save();
      }

      res.json({ message: "Place added", itinerary });
  } catch (error) {
      console.error("Error adding place:", error);
      res.status(500).json({ message: "Error adding place", error: error.message });
  }
});

 const addUserToItinerary = expressAsyncHandler(async (req, res) => {
    const {id} = req.params;
    const {userId} = req.body;
    try {
        const itinerary = await Itinerary.findById(id);
        if (!itinerary) return res.status(404).json({message: "Itinerary not found"});
        if (!itinerary.users.includes(userId)) {
            itinerary.users.push(userId);

            await itinerary.save();
        }
        res.json({message: "User added", itinerary});
    }
    catch(error){
        res.status(500).json({message: "Error finding user"});
    }
  })
  

module.exports = {createItinerary, updateItinerary, addPlaceToItinerary, addUserToItinerary};
