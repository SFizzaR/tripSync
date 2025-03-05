const express = require("express");
const router = express.Router();
const { getPlaces } = require("../controller/placesController");

router.get('/getplaces', getPlaces);

module.exports = router;