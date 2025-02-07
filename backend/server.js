const express = require("express");
const connectDB = require("./configs/dbConnections");
const { errorHandler } = require("./middleware/errorHandler"); // ✅ Correct import
const dotenv = require("dotenv").config();
const cors = require("cors");

connectDB();
const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/users", require("./routes/UserRoute"));

// ✅ Use errorHandler properly
app.use(errorHandler); 

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
