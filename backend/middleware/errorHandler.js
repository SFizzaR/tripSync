const {constants} = require("../constants");
const jwt = require("jsonwebtoken");

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

const protect = (req, res, next) => {
  let token = req.headers.authorization;

  if (!token || !token.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
      token = token.split(" ")[1]; 
      const decoded = jwt.verify(token, process.env.ACCESS_SECRET_TOKEN);

      if (!decoded || !decoded.user) {
          return res.status(401).json({ message: "Invalid token" });
      }

      req.user = decoded.user; // Attach user data to request
      next();
  } catch (error) {
      return res.status(401).json({ message: "Token verification failed", error: error.message });
  }
};

  
module.exports ={errorHandler, protect};
