const expressAsyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = expressAsyncHandler(async (req, res) => {
    const { username, email, password, age, city, first_name, last_name } = req.body;
  
    // Check for missing fields
    if (!username || !email || !password || !age || !first_name || !last_name) {
      res.status(400).json({ message: "All fields are mandatory" });
      return; // Ensure no further code runs
    }
  
    // Check if the user already exists
    const userAvailable = await User.findOne({ email }) || await User.findOne({ username });
    if (userAvailable) {
      res.status(400).json({ message: "User already registered" });
      return; // Stop further execution
    }
  
    // Hash the password
    const hashPassword = await bcrypt.hash(password, 10);
  
    // Create the user in the database
    const user = await User.create({
      username,
      email,
      password: hashPassword,
      age,
      first_name,
      last_name,
      city: city || null
    });

    console.log(`User created ${user}`)
  
    // Send success response
    if (user) {
      res.status(201).json({
        _id: user.id,
        username: user.username,
        email: user.email,
      });
      return; // Ensure no further code runs
    } else {
      res.status(400).json({ message: "Invalid user data" });
      return; // Stop further execution
    }
  });
  

  const loginUser = expressAsyncHandler(async (req, res) => {
    const { email, password, username } = req.body;
  
    // Check for missing fields
    if ((!email && !username) || !password) {
      res.status(400).json({ message: "Input correct credentials for login" });
      return; // Ensure no further code runs
    }
  
    // Find the user by email
    const user = await User.findOne({ email }) || await User.findOne({ username });
  
    // Check if user exists and if the password matches
    if (user && (await bcrypt.compare(password, user.password))) {
      // Generate an access token
      const accessToken = jwt.sign(
        {
          user: {
            username: user.username,
            email: user.email,
            id: user.id,
          },
        },
        process.env.ACCESS_SECRET_TOKEN,
        { expiresIn: "1m" }
      );
  
      res.status(200).json({ accessToken });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });
  

module.exports = {registerUser, loginUser};