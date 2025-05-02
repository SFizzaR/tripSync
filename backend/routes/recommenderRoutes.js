const express = require("express");
const { recommendations } = require("../controller/recommendationController");

const router = express.Router();

router.get('/recommendations/:userId', recommendations);

module.exports = router;