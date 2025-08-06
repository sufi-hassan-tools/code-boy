const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getPrivateKey, getPublicKey } = require("../config/jwt");
const tokenStore = require("../config/tokenStore");
const User = require("../models/User");
const router = express.Router();

const ACCESS_EXP = 15 * 60 * 1000; // 15 minutes
const REFRESH_EXP = 7 * 24 * 60 * 60 * 1000; // 7 days

function generateAccessToken(id) {
  return jwt.sign({ id }, getPrivateKey(), { algorithm: "RS256", expiresIn: "15m" });
}

function generateRefreshToken(id) {
  return jwt.sign({ id }, getPrivateKey(), { algorithm: "RS256", expiresIn: "7d" });
}

function setTokens(res, accessToken, refreshToken) {
  const secure = process.env.NODE_ENV === "production";
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    sameSite: "strict",
    maxAge: ACCESS_EXP,
    secure,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    maxAge: REFRESH_EXP,
    secure,
  });
}

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

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    tokenStore.save(refreshToken, user._id.toString(), Date.now() + REFRESH_EXP);
    setTokens(res, accessToken, refreshToken);
    res.status(201).json({ user: { name: user.name, email: user.email } });
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

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    tokenStore.save(refreshToken, user._id.toString(), Date.now() + REFRESH_EXP);
    setTokens(res, accessToken, refreshToken);
    res.status(200).json({ user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/refresh", (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ msg: "No token" });
  try {
    jwt.verify(token, getPublicKey(), { algorithm: "RS256" });
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }
  const data = tokenStore.consume(token);
  if (!data) return res.status(401).json({ msg: "Invalid token" });
  const accessToken = generateAccessToken(data.userId);
  const refreshToken = generateRefreshToken(data.userId);
  tokenStore.save(refreshToken, data.userId, Date.now() + REFRESH_EXP);
  setTokens(res, accessToken, refreshToken);
  return res.json({ msg: "refreshed" });
});

router.post("/logout", (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    tokenStore.remove(token);
  }
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json({ msg: "Logged out" });
});

module.exports = router;

