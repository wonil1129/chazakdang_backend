const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/auth');
const upload = require('../middleware/upload');

// public routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/upload_profile_image', verifyToken, upload.single('image'), userController.uploadProfileImage);
router.post('/upload_nutrients_image', verifyToken, upload.single('image'), userController.uploadNutrientsImage);
router.post('/delete_account', verifyToken, userController.deleteAccount);

// protected routes
router.get('/profile', verifyToken, userController.getProfile);
router.get('/profile/detail', verifyToken, userController.getDetailedProfile);

module.exports = router;
