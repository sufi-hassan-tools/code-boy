const express = require("express");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("../models/User");
const router = express.Router();

let resetTokens = {};

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    resetTokens[email] = token;

    const resetLink = `https://your-frontend-domain/reset-password/${token}`;
    const transporter = nodemailer.createTransporter({
      service: "gmail",
      auth: {
        user: process.env.RESET_EMAIL,
        pass: process.env.RESET_PASS
      }
    });

    await transporter.sendMail({
      to: email,
      subject: "Reset Your Password",
      html: `<p>Click below to reset password:</p><a href="${resetLink}">${resetLink}</a>`
    });

    res.json({ msg: "Reset link sent" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { email, newPassword } = req.body;

  try {
    if (resetTokens[email] !== token) return res.status(400).json({ msg: "Invalid token" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashed });

    delete resetTokens[email];
    res.json({ msg: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;

