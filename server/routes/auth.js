const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getPrivateKey } = require("../config/jwt");
const User = require("../models/User");
const router = express.Router();

router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed });

    const token = jwt.sign({ id: user._id }, getPrivateKey(), {
      algorithm: 'RS256',
      expiresIn: '7d'
    });
    res.status(201).json({ token, user: { email: user.email } });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, getPrivateKey(), {
      algorithm: 'RS256',
      expiresIn: '7d'
    });
    res.status(200).json({ token, user: { email: user.email } });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;

