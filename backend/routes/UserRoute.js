const express = require("express");
const {loginUser, registerUser, getFirstname} = require("../controller/UserController");
const router = express.Router();

router.post('/register', registerUser);
router.post("/login", loginUser);
router.get("/getname", getFirstname);

module.exports = router;