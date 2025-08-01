const express = require("express");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("../models/User");
const router = express.Router();

let resetTokens = {};

// support both /forgot-password (documented) and /forgot (legacy)
router.post(["/forgot-password", "/forgot"], async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ msg: "Email is required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    resetTokens[email] = token;

    // Build password reset link using optional FRONTEND_URL env or default localhost
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetLink = `${frontendUrl}/reset-password/${token}`;

    // Ensure email credentials are defined
    const { RESET_EMAIL, RESET_PASS } = process.env;
    if (!RESET_EMAIL || !RESET_PASS) {
      console.error("Password reset email credentials missing");
      return res.status(500).json({ msg: "Email configuration missing" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: RESET_EMAIL,
        pass: RESET_PASS,
      },
    });

    await transporter.sendMail({
      to: email,
      subject: "Reset Your Password",
      html: `<p>Click below to reset password:</p><a href="${resetLink}">${resetLink}</a>`,
    });

    res.json({ msg: "Reset link sent" });
  } catch (err) {
    console.error("Error sending reset email:", err);
    res.status(500).json({ msg: "Failed to send reset email" });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ msg: "Email and new password are required" });
  }

  try {
    if (resetTokens[email] !== token) return res.status(400).json({ msg: "Invalid token" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashed });

    delete resetTokens[email];
    res.json({ msg: "Password reset successful" });
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).json({ msg: "Failed to reset password" });
  }
});

module.exports = router;

