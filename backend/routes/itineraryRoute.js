const express = require("express");
const {createItinerary,getSoloItineraries,getColabItineraries ,updateItinerary, addPlaceToItinerary, addUserToItinerary,deleteUser,deletePlace} = require("../controller/itineraryController");
const router = express.Router();
const {protect} = require("../middleware/errorHandler")

router.post('/CreateItinerary', protect, createItinerary);
router.put('/:id', updateItinerary);
router.post('/places/:id', addPlaceToItinerary);
router.post('/users/:id', addUserToItinerary);
router.get("/solo", protect, getSoloItineraries);
router.get("/colab", protect, getColabItineraries);
router.delete('/:itineraryId/remove-user/:userId', protect, deleteUser);
router.delete('/:itineraryId/remove-place/:placeId', deletePlace)

module.exports = router;
