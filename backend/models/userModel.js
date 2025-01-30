const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please add the user name"],
      unique: [true, "Username already taken"],
    },
    email: {
      type: String,
      required: [true, "Please add the email"],
      unique: [true, "Email address already taken"],
    },
    password: {
      type: String,
      required: [true, "Please add the password"],
    },
    first_name: {
      type: String,
      required: [true, "Please add the first name"],
    },
    last_name: {
      type: String,
      required: [true, "Please add the last name"],
    },
    age: {
      type: Number,
      required: [true, "Please enter age"]
    },
    city: {
      type: String
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
