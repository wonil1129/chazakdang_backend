const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, rankingController.getRankingByPeriod);

module.exports = router;