const express = require("express");
const { loginUser, registerUser, getFirstname, getUsers, getAllUsersExceptCurrent, storeToken } = require("../controller/UserController");
const { protect } = require("../middleware/errorHandler");
const jwt = require("jsonwebtoken");

const router = express.Router();



router.post('/register', registerUser);
router.post("/login", loginUser);
router.get("/getname", protect, getFirstname);
router.get("/search", getUsers);
router.get("/all", protect, getAllUsersExceptCurrent);
router.post("/storeToken", protect, storeToken);
router.put("/edit", protect, editProfile);

module.exports = router;
