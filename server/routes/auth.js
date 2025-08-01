const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getPrivateKey } = require("../config/jwt");
const User = require("../models/User");
const router = express.Router();

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ msg: "Name, email and password are required" });
  }
  console.log("Signup attempt for email:", email);
  try {
    const exists = await User.findOne({ email });
    if (exists) {
      console.log("Email already in use:", email);
      return res.status(400).json({ msg: "Email already in use" });
    }

    const hashed = await bcrypt.hash(password, 10);
    console.log("Password hashed.");
    const user = await User.create({ name, email, password: hashed });
    console.log("User created:", user.email);

    const token = jwt.sign({ id: user._id }, getPrivateKey(), {
      algorithm: 'RS256',
      expiresIn: '7d'
    });
    console.log("JWT token generated.");
    res.status(201).json({ token, user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error("Server error during signup:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ msg: "Email and password are required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, getPrivateKey(), {
      algorithm: 'RS256',
      expiresIn: '7d'
    });
    res.status(200).json({ token, user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;

