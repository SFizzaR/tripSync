const express = require("express");
const {loginUser, registerUser, getFirstname, getUsers,getAllUsersExceptCurrent} = require("../controller/UserController");
const { protect } = require("../middleware/errorHandler");
const jwt = require("jsonwebtoken");

const router = express.Router();



router.post('/register', registerUser);
router.post("/login", loginUser);
router.get("/getname",protect,getFirstname);
router.get("/search", getUsers);
router.get("/all", protect,getAllUsersExceptCurrent);

module.exports = router;