const { CronJob } = require('cron');
const { updatedailyRanking, updateweeklyRanking, updatemonthlyRanking } = require('../services/rankingUpdater');

// 일간 랭킹 업데이트 (매일 0시)
new CronJob('0 0 * * *', async () => {
    console.log('일간 랭킹 업데이트');
    try {
        await updatedailyRanking();
        console.log('일간 랭킹 업데이트 완료');
    } catch (err) {
        console.error('일간 랭킹 업데이트 실패:', err);
    }
}, null, true, 'Asia/Seoul');

// 주간 랭킹 업데이트 (매주 월요일 0시)
new CronJob('0 0 * * 1', async () => {
    console.log('주간 랭킹 업데이트');
    try {
        await updateweeklyRanking();
        console.log('주간 랭킹 업데이트 완료');
    } catch (err) {
        console.error('주간 랭킹 업데이트 실패:', err);
    }
}, null, true, 'Asia/Seoul');

// 월간 랭킹 업데이트 (매월 1일 0시)
new CronJob('0 0 1 * *', async () => {
    console.log('월간 랭킹 업데이트');
    try {
        await updatemonthlyRanking();
        console.log('월간 랭킹 업데이트 완료');
    } catch (err) {
        console.error('월간 랭킹 업데이트 실패:', err);
    }
}, null, true, 'Asia/Seoul');