const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');
const { verifyToken } = require('../middleware/auth');

// 일별, 주별, 월별 랭킹 조회
// router.get('/dailyRanking', verifyToken, rankingController.dailyRanking);
// router.get('/weeklyRanking', verifyToken, rankingController.weeklyRanking);
// router.get('/monthlyRanking', verifyToken, rankingController.monthlyRanking);

// GET /api/rankings?period=daily|weekly|monthly
router.get('/', verifyToken, rankingController.getRankingByPeriod);


module.exports = router;

