const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../utils/cloudinary');
const streamifier = require('streamifier');
const { protect, admin } = require('../middleware/authMiddleware');

// Configure multer for memory storage (buffer)
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test((file.originalname || '').toLowerCase());
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed!'));
};
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// @desc    Upload a file to Cloudinary
// @route   POST /api/upload
// @access  Private/Admin
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'products', resource_type: 'image' },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });
    };
    const result = await streamUpload(req.file.buffer);
    res.json({
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ message: 'File upload failed', error: error.message });
  }
});

// @desc    Delete a file from Cloudinary
// @route   DELETE /api/upload/:public_id
// @access  Private/Admin
router.delete('/:public_id', protect, admin, async (req, res) => {
  try {
    const publicId = req.params.public_id;
    await cloudinary.uploader.destroy(publicId);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    res.status(500).json({ message: 'File deletion failed', error: error.message });
  }
});

// @desc    Upload a profile image to Cloudinary
// @route   POST /api/upload/profile
// @access  Private
router.post('/profile', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'profiles', resource_type: 'image' },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });
    };
    const result = await streamUpload(req.file.buffer);
    res.json({ imageUrl: result.secure_url, public_id: result.public_id });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading profile image', error: error.message });
  }
});

module.exports = router;