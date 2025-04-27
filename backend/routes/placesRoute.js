const express = require("express");
const { getPlaces, getPlaceById } = require("../controller/placesController");

const router = express.Router();

router.get('/getplaces', getPlaces);
router.get("/place/:fsq_id", getPlaceById);

module.exports = router;
