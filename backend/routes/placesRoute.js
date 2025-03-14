const express = require("express");
const { getPlaces } = require("../controller/placesController");

const router = express.Router();

router.get('/getplaces', getPlaces);

module.exports = router;

