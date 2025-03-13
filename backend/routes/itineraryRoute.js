const express = require("express");
const {createItinerary,getSoloItineraries,getColabItineraries ,updateItinerary, addPlaceToItinerary, addUserToItinerary, deleteUser, deletePlace, deleteItinerary} = require("../controller/itineraryController");
const router = express.Router();
const {protect} = require("../middleware/errorHandler")

router.post('/CreateItinerary', protect, createItinerary);
router.put('/:id', updateItinerary);
router.post('/:Itineraryid/places/:placeId', addPlaceToItinerary);
router.post('/:Itineraryid/users/:userId', addUserToItinerary);
router.get("/solo", protect, getSoloItineraries);
router.get("/colab", protect, getColabItineraries);
router.delete('/:itineraryId/remove-user/:userId', protect, deleteUser);
router.delete('/:itineraryId/remove-place/:placeId', deletePlace)
router.delete("/:itineraryId", protect, deleteItinerary);

module.exports = router;
