const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');

// 일별, 주별, 월별 랭킹 조회
router.get('/dailyRanking', rankingController.dailyRanking);
router.get('/weeklyRanking', rankingController.weeklyRanking);
router.get('/monthlyRanking', rankingController.monthlyRanking);


module.exports = router;

