const express = require("express");
const User = require("../models/User");
const protect = require("../middleware/auth");
const router = express.Router();

// Get current user
router.get("/me", protect, (req, res) => {
  res.json({ name: req.user.name, email: req.user.email });
});

// Update current user
router.put("/me", protect, async (req, res) => {
  const { name, email } = req.body;
  try {
    if (name) req.user.name = name;
    if (email) req.user.email = email;
    await req.user.save();
    res.json({ name: req.user.name, email: req.user.email });
  } catch (err) {
    res.status(500).json({ msg: "Error updating user" });
  }
});

module.exports = router;
