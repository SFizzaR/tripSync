const express = require("express");
const { loginUser, registerUser, getFirstname, getUsers, getAllUsersExceptCurrent, storeToken, getUser,
  updateUsername,
  updatePassword,
  updateCity, } = require("../controller/UserController");
const { protect } = require("../middleware/errorHandler");
const jwt = require("jsonwebtoken");

const router = express.Router();



router.post('/register', registerUser);
router.post("/login", loginUser);
router.get("/getname", protect, getFirstname);
router.get("/search", getUsers);
router.get("/all", protect, getAllUsersExceptCurrent);
router.post("/storeToken", protect, storeToken);
router.get("/getUser/:userId", protect, getUser);
router.put("/updateUsername/:userId",updateUsername)
router.put("/updatePassword/:userId",updatePassword)
router.put("/updateCity/:userId",updateCity)

module.exports = router;