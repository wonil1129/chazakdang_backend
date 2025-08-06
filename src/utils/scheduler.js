const cron = require('node-cron');
const {updatedailyRanking, updateweeklyRanking, updatemonthlyRanking} = require('../services/rankingUpdater');

cron.schedule('0 0 * * *', () => {
    console.log('일간 랭킹 업데이트');
    updatedailyRanking()
        .then(() => console.log('일간 랭킹 업데이트 완료'))
        .catch(err => console.error('일간 랭킹 업데이트 실패:', err));
}, {timezone: 'Asia/Seoul'

});

cron.schedule('0 0 * * *', () => {
    console.log('일간 랭킹 업데이트');
    updateweeklyRanking()
        .then(() => console.log('주간 랭킹 업데이트 완료'))
        .catch(err => console.error('주간 랭킹 업데이트 실패:', err));
}, {timezone: 'Asia/Seoul'
    
});

cron.schedule('0 0 * * *', () => {
    console.log('일간 랭킹 업데이트');
    updatemonthlyRanking()
        .then(() => console.log('월간 랭킹 업데이트 완료'))
        .catch(err => console.error('월간 랭킹 업데이트 실패:', err));
}, {timezone: 'Asia/Seoul'
    
});