const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /api/users/me -> Get basic user info (id, name, image)
router.get('/me', verifyToken, userController.getProfile);

// GET /api/users/me/profile -> Get detailed user info
router.get('/me/profile', verifyToken, userController.getDetailedProfile);

// PUT /api/users/me/profile -> Update user info
router.put('/me/profile', verifyToken, userController.updateUserInfo);

// DELETE /api/users/me -> Delete user account
router.delete('/me', verifyToken, userController.deleteAccount);

// POST /api/users/me/image -> Upload profile image
router.post('/me/image', verifyToken, upload.single('image'), userController.uploadProfileImage);

// GET /api/users/me/today-summary -> Get today's summary
router.get('/me/today-summary', verifyToken, userController.getTodaySummary);

module.exports = router;
