const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

// POST /api/calendar/date -> Get eating history for a specific date
router.post('/date', verifyToken, userController.getEatingHistoryByDate);

// GET /api/calendar/status -> Get which days in a month have records
// Access the month via req.query.month in your controller
router.get('/status', verifyToken, userController.getDaysWithRecords);

module.exports = router;