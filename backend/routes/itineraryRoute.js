const express = require("express");
const {createItinerary, updateItinerary, addPlaceToItinerary, addUserToItinerary} = require("../controller/itineraryController");
const router = express.Router();
const {protect} = require("../middleware/errorHandler")

router.post('/CreateItinerary', protect, createItinerary);
router.put('/:id', updateItinerary);
router.post('/places/:id', addPlaceToItinerary);
router.post('/users/:id', addUserToItinerary);

module.exports = router;
