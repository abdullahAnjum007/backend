const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const http = require("http");
const cors = require("cors");
const { initializeIo } = require("./io"); // Import the io.js file
const complainRoutes = require("./routes/complain");
const userRoutes = require("./routes/user");
const exhibitRoutes = require("./routes/exhibits");
const pushTokenRoutes = require("./routes/pushToken");

dotenv.config({ path: "./config.env" });

const app = express();
const server = http.createServer(app);

// initializeIo(server); // Initialize Socket.IO with the server instance

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/v1", complainRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1", exhibitRoutes);
app.use("/api/v1", pushTokenRoutes);
//
// Root route
// app.get("/", (req, res) => {
//   res.json({ message: "Connected successfully!" });
// });
//
//
app.get("/any", async (req, res) => {
  try {
    console.log("Testing database connection...");

    // Connect to the database
    await mongoose.connection.db.admin().ping();
    res.status(200).json({
      success: true,
      message: "Database connection successful!",
    });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({
      success: false,
      message: "Database connection failed.",
      error: error.message,
    });
  }
});

//
// Connect to MongoDB and start the server
const PORT = process.env.PORT || 5000;
const DB_URI = "mongodb://localhost:27017/complaints";

mongoose
  .connect(DB_URI)
  .then(() => {
    console.log("Connected to MongoDB successfully!");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });

module.exports = server;
