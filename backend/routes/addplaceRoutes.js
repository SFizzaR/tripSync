const express = require('express')
const { fetchAndStorePlaces, fetchPhotosAndReviews, fetchPlacesForAllCities } = require('../controller/addplaceController')
const { protect } = require('../middleware/errorHandler');
router = express.Router()

router.get("/fetch", fetchAndStorePlaces);
router.get("/fetchphotoreview", fetchPhotosAndReviews);
router.get("/fetch-all-cities", fetchPlacesForAllCities);

module.exports = router;