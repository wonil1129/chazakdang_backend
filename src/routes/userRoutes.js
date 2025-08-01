const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/auth');

// public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// protected routes
router.get('/profile', verifyToken, userController.getProfile);

module.exports = router;
