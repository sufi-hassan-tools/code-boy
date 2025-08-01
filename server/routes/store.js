const express = require("express");
const jwt = require("jsonwebtoken");
const { getPublicKey } = require("../config/jwt");
const Store = require("../models/Store");
const User = require("../models/User");
const router = express.Router();

// Middleware to protect routes
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token" });

  try {
    const decoded = jwt.verify(token, getPublicKey(), { algorithm: 'RS256' });
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
};

// Create Store - only one store per user
router.post("/create", protect, async (req, res) => {
  const storeData = { ...req.body, user: req.userId };
  try {
    const existing = await Store.findOne({ user: req.userId });
    if (existing) {
      return res.status(400).json({ msg: "Store already exists" });
    }

    const store = await Store.create(storeData);
    await User.findByIdAndUpdate(req.userId, { storeCreated: true });
    res.status(201).json({ msg: "Store created", store });
  } catch (err) {
    res.status(500).json({ msg: "Error creating store" });
  }
});

// Get current user's store
router.get("/me", protect, async (req, res) => {
  try {
    const store = await Store.findOne({ user: req.userId });
    if (!store) return res.status(404).json({ msg: "No store" });
    res.json(store);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching store" });
  }
});

// Update store
router.put("/update", protect, async (req, res) => {
  try {
    const store = await Store.findOneAndUpdate(
      { user: req.userId },
      req.body,
      { new: true }
    );
    if (!store) return res.status(404).json({ msg: "No store" });
    res.json(store);
  } catch (err) {
    res.status(500).json({ msg: "Error updating store" });
  }
});

module.exports = router;

