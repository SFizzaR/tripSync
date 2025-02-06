const expressAsyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = expressAsyncHandler(async (req, res) => {
  const { first_name, last_name, username, email, age, city, password } = req.body;

  // Check for missing fields
  if (!first_name || !last_name || !username || !email || !age || !password) {
    res.status(400).json({ message: "All fields are mandatory" });
    return; // Ensure no further code runs
  }

  // Check if the user already exists
  const userAvailable = await User.findOne({ email });
  if (userAvailable) {
    res.status(400).json({ message: "User already registered" });
    return; // Stop further execution
  }

  // Hash the password
  const hashPassword = await bcrypt.hash(password, 10);

  // Create the user in the database
  const user = await User.create({
    first_name,
    last_name,
    age, 
    city, 
    username,
    email,
    password: hashPassword,
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

  const getFirstname = expressAsyncHandler(async (req, res) => {
    try {
        const { input } = req.params; // Use 'input' to handle both username and email

        // Check if input is an email
        const isEmail = /\S+@\S+\.\S+/.test(input);

        // Search by email if it's an email, otherwise search by username
        const user = await User.findOne(isEmail ? { email: input } : { username: input });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ firstName: user.first_name });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


module.exports = {registerUser, loginUser, getFirstname};