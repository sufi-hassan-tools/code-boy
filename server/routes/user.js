const express = require("express");
const jwt = require("jsonwebtoken");
const { getPublicKey } = require("../config/jwt");
const User = require("../models/User");
const router = express.Router();

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

router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('name email');
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching user" });
  }
});

module.exports = router;
