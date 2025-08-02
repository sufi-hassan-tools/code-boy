const express = require("express");
const Store = require("../models/Store");
const User = require("../models/User");
const protect = require("../middleware/auth");
const router = express.Router();

// Create Store - only one store per user
router.post("/create", protect, async (req, res) => {
  const storeData = { ...req.body, user: req.user._id };
  try {
    const existing = await Store.findOne({ user: req.user._id });
    if (existing) {
      return res.status(400).json({ msg: "Store already exists" });
    }

    const store = await Store.create(storeData);
    await User.findByIdAndUpdate(req.user._id, { storeCreated: true });
    res.status(201).json({ msg: "Store created", store });
  } catch (err) {
    res.status(500).json({ msg: "Error creating store" });
  }
});

// Get current user's store
const getStore = async (req, res) => {
  try {
    const store = await Store.findOne({ user: req.user._id });
    if (!store) return res.status(404).json({ msg: "No store" });
    res.json(store);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching store" });
  }
};
router.get(["/me", "/my-store"], protect, getStore);

// Update store
router.put("/update", protect, async (req, res) => {
  try {
    const store = await Store.findOneAndUpdate(
      { user: req.user._id },
      req.body,
      { new: true }
    );
    if (!store) return res.status(404).json({ msg: "No store" });
    res.json(store);
  } catch (err) {
    res.status(500).json({ msg: "Error updating store" });
  }
});

// Update store theme
router.put("/theme", protect, async (req, res) => {
  try {
    const store = await Store.findOneAndUpdate(
      { user: req.user._id },
      { theme: req.body.theme },
      { new: true }
    );
    if (!store) return res.status(404).json({ msg: "No store" });
    res.json({ msg: "Theme updated", store });
  } catch (err) {
    res.status(500).json({ msg: "Error updating theme" });
  }
});

module.exports = router;
