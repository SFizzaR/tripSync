const express = require("express");
const connectDB = require("./configs/dbConnections");
const errorHandler = require('./middleware/errorHandler');

const dotenv = require("dotenv").config();

connectDB();
const app = express();

const port = process.env.PORT || 5000;

app.use(express.json());
app.use("/api/users", require("./routes/UserRoute"));
app.use(errorHandler)

app.listen(port, ()=>{
    console.log(`server running on port:  ${port}`)
})