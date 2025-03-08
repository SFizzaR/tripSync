const express = require("express");
const { getBlocked, createBlocked, removeBlocked } = require("../controller/blockedController");
const router = express.Router();
const { protect } = require("../middleware/errorHandler");

router.post("/:itineraryId", protect, createBlocked);
router.get("/", protect, getBlocked);
router.delete("/:itineraryId", protect, removeBlocked);

module.exports = router;