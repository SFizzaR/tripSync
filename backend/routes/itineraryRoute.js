
const express = require("express");
const {createItinerary,getSoloItineraries,getColabItineraries ,updateItinerary, addPlaceToItinerary,getItineraryPlaces ,addUserToItinerary, deleteUser, deletePlace} = require("../controller/itineraryController");
const router = express.Router();
const {protect} = require("../middleware/errorHandler")

router.post('/CreateItinerary', protect, createItinerary);
router.put('/:id', updateItinerary);
router.post('/:itineraryId/places/:placeId', addPlaceToItinerary);
router.post('/:Itineraryid/users/:userId', addUserToItinerary);
router.get("/:itineraryId/placeDisplay", getItineraryPlaces);
router.get("/solo", protect, getSoloItineraries);
router.get("/colab", protect, getColabItineraries);
router.delete('/:itineraryId/remove-user/:userId', protect, deleteUser);
router.delete('/:itineraryId/remove-place/:placeId', deletePlace)

module.exports = router;
