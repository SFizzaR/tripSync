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

    const accessToken = jwt.sign(
      { user: { id: user.id, username: user.username, email: user.email } },
      process.env.ACCESS_SECRET_TOKEN,
      { expiresIn: "1h" }
    );

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

  // Find the user by email or username
  const user = await User.findOne({ email }) || await User.findOne({ username });

  // Check if user exists and if the password matches
  if (user && (await bcrypt.compare(password, user.password))) {
    // Generate an access token
    const accessToken = jwt.sign(
      { user: { id: user._id, username: user.username, email: user.email } }, // ✅ Change `user.id` to `user._id`
      process.env.ACCESS_SECRET_TOKEN,
      { expiresIn: "1h" }
    );


    res.status(200).json({
      _id: user.id,
      username: user.username,
      email: user.email,
      accessToken,
    });

    // console.log("Stored Token:", localStorage.getItem("accessToken"));


  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

const getFirstname = expressAsyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("first_name username email city"); // Fetch first_name

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ first_name: user.first_name, username: user.username, email: user.email, city: user.city });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

const getUsers = expressAsyncHandler(async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: name, $options: "i" } }
      ]
    }).select("_id username"); // Select only necessary fields

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

const getAllUsersExceptCurrent = async (req, res) => {
  try {
    const loggedInUserId = req.user.id; // Ensure your middleware attaches user info

    const users = await User.find({ _id: { $ne: loggedInUserId } }).select("username email"); // Exclude current user

    res.status(200).json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const storeToken = expressAsyncHandler(async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.user.id; // Assuming you have authentication middleware

    if (!fcmToken) {
      return res.status(400).json({ error: "FCM token is required" });
    }

    // Find the user and update the FCM token
    const user = await User.findByIdAndUpdate(
      userId,
      { fcmToken },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: "FCM token stored successfully", user });
  } catch (error) {
    console.error("Error storing FCM token:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
})

const getUser = expressAsyncHandler(async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).select("username city");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ username: user.username, city: user.city });
  } catch (error) {
    console.error("Error fetching user:", error.message);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

const updateUsername = expressAsyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json({ error: "Username already taken" });
    }

    user.username = username;
    await user.save();

    // Generate new access token with updated username
    const accessToken = jwt.sign(
      { user: { id: user._id, username: user.username, email: user.email } },
      process.env.ACCESS_SECRET_TOKEN,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Username updated successfully", username, accessToken });
  } catch (error) {
    console.error("Error updating username:", error.message);
    res.status(500).json({ error: "Failed to update username" });
  }
});

const updatePassword = expressAsyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "All password fields are required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashPassword;
    await user.save();
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error.message);
    res.status(500).json({ error: "Failed to update password" });
  }
});

const updateCity = expressAsyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { city } = req.body;

  if (!city) {
    return res.status(400).json({ error: "City is required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.city = city;
    await user.save();
    res.status(200).json({ message: "City updated successfully", city });
  } catch (error) {
    console.error("Error updating city:", error.message);
    res.status(500).json({ error: "Failed to update city" });
  }
});

module.exports = {
  registerUser,
  loginUser,
  getFirstname,
  getUsers,
  getAllUsersExceptCurrent,
  storeToken,
  getUser,
  updateUsername,
  updatePassword,
  updateCity,
};