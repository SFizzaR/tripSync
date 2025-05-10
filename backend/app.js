const express = require("express");
const cors = require('cors');
const dotenv = require("dotenv").config();
const { errorHandler } = require('./middleware/errorHandler');
const connectDB = require("./configs/dbConnections");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/users", require("./routes/UserRoute"));
app.use("/api/itineraries", require('./routes/itineraryRoute'));
app.use("/api/places", require("./routes/placesRoute"));
app.use("/api/addplace", require('./routes/addplaceRoutes'));
app.use("/api/invite", require('./routes/invitationRoutes'));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/recommendations", require("./routes/recommenderRoutes"));

app.use(errorHandler);

module.exports = app;
