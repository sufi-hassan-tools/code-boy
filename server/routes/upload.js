const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const protect = require('../middleware/auth');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only images allowed'));
    }
    cb(null, true);
  }
});

router.post('/store-image', protect, upload.single('image'), async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'storeImages', userId);
    await fs.promises.mkdir(uploadsDir, { recursive: true });

    const originalName = path.parse(req.file.originalname).name;
    const filename = `${originalName}.webp`;
    const filePath = path.join(uploadsDir, filename);

    let quality = 80;
    let buffer = await sharp(req.file.buffer)
      .resize({ width: 1024, withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();

    while (buffer.length > 300 * 1024 && quality > 10) {
      quality -= 10;
      buffer = await sharp(req.file.buffer)
        .resize({ width: 1024, withoutEnlargement: true })
        .webp({ quality })
        .toBuffer();
    }

    if (buffer.length > 300 * 1024) {
      return res.status(400).json({ msg: 'Image too large' });
    }

    await sharp(buffer).toFile(filePath);
    const url = `/uploads/storeImages/${userId}/${filename}`;
    res.json({ url });
  } catch (err) {
    res.status(500).json({ msg: 'Error processing image' });
  }
});

module.exports = router;
