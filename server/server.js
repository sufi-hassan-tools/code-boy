const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });
connectDB();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/store", require("./routes/store"));
app.use("/api/users", require("./routes/user"));
app.use("/api/password", require("./routes/forgot"));
app.use("/api/upload", require("./routes/upload"));

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve frontend (React build) in production
app.use(express.static(path.join(__dirname, "../client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

if (require.main === module) {
  // Start Server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
}

module.exports = app;