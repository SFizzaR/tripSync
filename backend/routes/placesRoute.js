const express = require("express");
const { getPlaces, getPlaceById, ratePlace, getUserRatings } = require("../controller/placesController");

const router = express.Router();

router.get('/getplaces', getPlaces);
router.get("/place/:fsq_id", getPlaceById);
router.post('/rate',ratePlace);
router.get('/ratings/:userId',getUserRatings);

module.exports = router;