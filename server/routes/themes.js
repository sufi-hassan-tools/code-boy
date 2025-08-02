const express = require("express");
const jwt = require("jsonwebtoken");
const { getPublicKey } = require("../config/jwt");
const Theme = require("../models/Theme");
const Store = require("../models/Store");
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

// Get all available themes (marketplace)
router.get("/marketplace", async (req, res) => {
  try {
    const themes = await Theme.find({ store: null }).select('-templates -assets');
    res.json(themes);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching themes" });
  }
});

// Get user's installed themes
router.get("/my-themes", protect, async (req, res) => {
  try {
    const store = await Store.findOne({ user: req.userId });
    if (!store) return res.status(404).json({ msg: "Store not found" });

    const themes = await Theme.find({ store: store._id });
    res.json(themes);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching themes" });
  }
});

// Get active theme
router.get("/active", protect, async (req, res) => {
  try {
    const store = await Store.findOne({ user: req.userId });
    if (!store) return res.status(404).json({ msg: "Store not found" });

    const activeTheme = await Theme.findOne({ store: store._id, isActive: true });
    if (!activeTheme) return res.status(404).json({ msg: "No active theme" });

    res.json(activeTheme);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching active theme" });
  }
});

// Install theme
router.post("/install/:themeId", protect, async (req, res) => {
  try {
    const store = await Store.findOne({ user: req.userId });
    if (!store) return res.status(404).json({ msg: "Store not found" });

    const originalTheme = await Theme.findById(req.params.themeId);
    if (!originalTheme) return res.status(404).json({ msg: "Theme not found" });

    // Create a copy for the user's store
    const installedTheme = new Theme({
      ...originalTheme.toObject(),
      _id: undefined,
      store: store._id,
      isActive: false
    });

    await installedTheme.save();
    res.json({ msg: "Theme installed successfully", theme: installedTheme });
  } catch (err) {
    res.status(500).json({ msg: "Error installing theme" });
  }
});

// Activate theme
router.put("/activate/:themeId", protect, async (req, res) => {
  try {
    const store = await Store.findOne({ user: req.userId });
    if (!store) return res.status(404).json({ msg: "Store not found" });

    // Deactivate all themes for this store
    await Theme.updateMany({ store: store._id }, { isActive: false });

    // Activate the selected theme
    const theme = await Theme.findOneAndUpdate(
      { _id: req.params.themeId, store: store._id },
      { isActive: true },
      { new: true }
    );

    if (!theme) return res.status(404).json({ msg: "Theme not found" });

    res.json({ msg: "Theme activated successfully", theme });
  } catch (err) {
    res.status(500).json({ msg: "Error activating theme" });
  }
});

// Update theme settings
router.put("/settings/:themeId", protect, async (req, res) => {
  try {
    const store = await Store.findOne({ user: req.userId });
    if (!store) return res.status(404).json({ msg: "Store not found" });

    const theme = await Theme.findOneAndUpdate(
      { _id: req.params.themeId, store: store._id },
      { 
        settings: req.body.settings,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!theme) return res.status(404).json({ msg: "Theme not found" });

    res.json({ msg: "Theme settings updated", theme });
  } catch (err) {
    res.status(500).json({ msg: "Error updating theme settings" });
  }
});

// Upload custom theme
router.post("/upload", protect, async (req, res) => {
  try {
    const store = await Store.findOne({ user: req.userId });
    if (!store) return res.status(404).json({ msg: "Store not found" });

    const themeData = {
      ...req.body,
      store: store._id,
      isActive: false
    };

    const theme = await Theme.create(themeData);
    res.status(201).json({ msg: "Theme uploaded successfully", theme });
  } catch (err) {
    res.status(500).json({ msg: "Error uploading theme" });
  }
});

// Delete theme
router.delete("/:themeId", protect, async (req, res) => {
  try {
    const store = await Store.findOne({ user: req.userId });
    if (!store) return res.status(404).json({ msg: "Store not found" });

    const theme = await Theme.findOne({ _id: req.params.themeId, store: store._id });
    if (!theme) return res.status(404).json({ msg: "Theme not found" });

    if (theme.isActive) {
      return res.status(400).json({ msg: "Cannot delete active theme" });
    }

    await Theme.findByIdAndDelete(req.params.themeId);
    res.json({ msg: "Theme deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting theme" });
  }
});

module.exports = router;