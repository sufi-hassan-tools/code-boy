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

// Create Store
router.post("/create", protect, async (req, res) => {
  const storeData = { ...req.body, user: req.userId };
  try {
    const store = await Store.create(storeData);
    await User.findByIdAndUpdate(req.userId, { storeCreated: true });
    res.status(201).json({ msg: "Store created", store });
  } catch (err) {
    res.status(500).json({ msg: "Error creating store" });
  }
});

module.exports = router;

