const expressAsyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const Itinerary = require("../models/ItinerariesModel");

const createItinerary = expressAsyncHandler( async (req, res) => {
    try {
        const { places, collaborative, status} = req.body;
    
        if (!places || places.length === 0) {
          return res.status(400).json({ message: "At least one place is required." });
        }
    
        // Validate status
        const validStatuses = ["planning", "in-progress", "complete"];
        if (status && !validStatuses.includes(status)) {
          return res.status(400).json({ message: "Invalid status value." });
        }
    
        // Create the itinerary with the logged-in user as the first user
        const itinerary = new Itinerary({
          users: [req.user._id], // First user is the logged-in user
          places,
          collaborative,

          status: status || "planning", // Default status is "planning"
        });
    
        await itinerary.save();
    
        res.status(201).json(itinerary);
      } catch (error) {
        res.status(500).json({ message: "Error creating itinerary", error: error.message });
      }
});

const updateItinerary = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, status } = req.body;
  
    try {
      const itinerary = await Itinerary.findById(id);
      if (!itinerary) {
        return res.status(404).json({ message: "Itinerary not found" });
      }
  
      // Update only if provided
      if (title) itinerary.title = title;
      if (status) itinerary.status = status;
  
      await itinerary.save();
      res.json({ message: "Itinerary updated", itinerary });
    } catch (error) {
      res.status(500).json({ message: "Error updating itinerary", error });
    }
  });

  const addPlaceToItinerary = expressAsyncHandler(async (req, res) => {
    const { id } = req.params; // Itinerary ID
    const { placeId, city } = req.body;
  
    try {
      const itinerary = await Itinerary.findById(id);
      if (!itinerary) return res.status(404).json({ message: "Itinerary not found" });
  
      if (!itinerary.places.includes(placeId)) {
        itinerary.places.push(placeId);
  
        // If it's the first place, set title as city name
        if (itinerary.places.length === 1) {
          itinerary.title = city;
        }
  
        await itinerary.save();
      }
  
      res.json({ message: "Place added", itinerary });
    } catch (error) {
      res.status(500).json({ message: "Error adding place", error });
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
