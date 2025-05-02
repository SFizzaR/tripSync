const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      sparse: true,
      unique: [true, "Username already taken"],
    },
    email: {
      type: String,
      sparse: true,
      unique: [true, "Email address already taken"],
    },
    password: {
      type: String,
      sparse: true,
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
      sparse: true
    },
    city: {
      type: String
    },
    fcmToken: {
      type: String,
      default: null
    }
  }
);

module.exports = mongoose.model("User", userSchema);