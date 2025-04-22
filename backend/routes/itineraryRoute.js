const express = require("express");
const { createItinerary, getSoloItineraries, getColabItineraries, updateItinerary, addPlaceToItinerary, addUserToItinerary, deleteUser, deletePlace, getColabUsers } = require("../controller/itineraryController");
const router = express.Router();
const { protect } = require("../middleware/errorHandler")

router.post('/CreateItinerary', protect, createItinerary);
router.put('/:id', updateItinerary);
router.post("/:itineraryId/places/:placeId", addPlaceToItinerary);
router.post('/:Itineraryid/users/:userId', addUserToItinerary);
router.get("/solo", protect, getSoloItineraries);
router.get("/colab", protect, getColabItineraries);
router.delete('/:itineraryId/remove-user/:userId', protect, deleteUser);
router.delete('/:itineraryId/remove-place/:placeId', deletePlace);
router.get('/users/:itineraryId', protect, getColabUsers);

module.exports = router;
