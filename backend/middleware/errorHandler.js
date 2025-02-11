const {constants} = require("../constants");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const errorHandler = (err, req, res, next) =>{
    const statusCode = res.statusCode ? res.statusCode: 500;
    switch(statusCode){
        case constants.VALIDATION_ERROR:
            res.json({title: "Validation", message: err.message, stackTrace: err.stack});
            break;
        case constants.NOT_FOUND:
            res.json({title: "Not found", message: err.message, stackTrace: err.stack});
            break;
        case constants.FORBIDDEN:
            res.json({title: "Forbidden", message: err.message, stackTrace: err.stack});
            break;
        case constants.UNAUTHERIZED:
            res.json({title: "Unauthorized", message: err.message, stackTrace: err.stack});
            break;
        case constants.SERVER_ERROR:
            res.json({title: "Server error", message: err.message, stackTrace: err.stack});
            break;
        default:
            console.log("No Error. All good!");
            break;
    }
    next(); 
}

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      console.log("Received Token:", token); // Debugging

      const decoded = jwt.verify(token, process.env.ACCESS_SECRET_TOKEN);
      console.log("Decoded Token:", decoded); // Debugging

      req.user = await User.findById(decoded.user.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next();
    } catch (error) {
      console.error("JWT Error:", error.message);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};


module.exports ={errorHandler, protect};