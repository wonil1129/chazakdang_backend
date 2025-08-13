// rankingUpdater.js

const db = require('../../config/db'); // 데이터베이스 연결 설정 파일을 가져옵니다.

// 일간 랭킹을 계산하고 저장하는 함수
async function updateDailyRanking() {
    console.log('일간 랭킹 업데이트 시작...');
    const conn = await db.promise().getConnection(); // Connection Pool에서 연결 가져오기
    try {
        await conn.beginTransaction(); // 트랜잭션 시작

        // 새로운 일간 랭킹 계산 및 삽입
        const insertSql = `
            INSERT INTO ranking_log (user_id, ranking_type, score, rank_date)
            SELECT
                a.user_id,
                'daily',
                AVG(b.health_score) AS daily_score,
                CURDATE() as rank_date
            FROM user a
            JOIN eating_history b ON a.user_id = b.user_id
            WHERE DATE(b.eating_time) = CURDATE()
            GROUP BY a.user_id
            ORDER BY daily_score DESC
            ON DUPLICATE KEY UPDATE
                score = VALUES(score)
        `;
        const [rows] = await conn.query(insertSql);
        await conn.commit(); // 트랜잭션 커밋
        console.log(`일간 랭킹 업데이트 완료: ${rows.affectedRows}개 레코드 삽입`);
    } catch (err) {
        await conn.rollback(); // 오류 발생 시 롤백
        console.error('일간 랭킹 업데이트 실패:', err);
    } finally {
        if (conn) conn.release(); // 연결 반환
    }
}

// 주간 랭킹을 계산하고 저장하는 함수
async function updateWeeklyRanking() {
    console.log('주간 랭킹 업데이트 시작...');
    const conn = await db.promise().getConnection();


    try {
        await conn.beginTransaction();


        // 새로운 주간 랭킹 계산 및 삽입
        const insertSql = `
            INSERT INTO ranking_log (user_id, ranking_type, score, rank_date)
            SELECT 
                a.user_id, 
                'weekly', 
                AVG(b.health_score) AS weekly_score,
                DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) as rank_date
            FROM user a
            JOIN eating_history b ON a.user_id = b.user_id
            WHERE YEARWEEK(b.eating_time, 0) = YEARWEEK(CURDATE(), 0)
            GROUP BY a.user_id
            ORDER BY weekly_score DESC
            ON DUPLICATE KEY UPDATE
                score = VALUES(score)
        `;
        const [rows] = await conn.query(insertSql);
        await conn.commit();
        console.log(`주간 랭킹 업데이트 완료: ${rows.affectedRows}개 레코드 삽입`);
    } catch (err) {
        await conn.rollback();
        console.error('주간 랭킹 업데이트 실패:', err);
    } finally {
        if (conn) conn.release();
    }
}

// 월간 랭킹을 계산하고 저장하는 함수
async function updateMonthlyRanking() {
    console.log('월간 랭킹 업데이트 시작...');
    const conn = await db.promise().getConnection();

    try {
        await conn.beginTransaction();


        // 새로운 월간 랭킹 계산 및 삽입
        const insertSql = `
            INSERT INTO ranking_log (user_id, ranking_type, score, rank_date)
            SELECT 
                a.user_id, 
                'monthly', 
                AVG(b.health_score) AS monthly_score,
                DATE_FORMAT(CURDATE(), '%Y-%m-01') AS rank_date
            FROM user a
            JOIN eating_history b ON a.user_id = b.user_id
            WHERE MONTH(b.eating_time) = MONTH(CURDATE())
            AND YEAR(b.eating_time) = YEAR(CURDATE())
            GROUP BY a.user_id
            ORDER BY monthly_score DESC
            ON DUPLICATE KEY UPDATE
                score = VALUES(score)
        `;
        const [rows] = await conn.query(insertSql);
        await conn.commit();
        console.log(`월간 랭킹 업데이트 완료: ${rows.affectedRows}개 레코드 삽입`);
    } catch (err) {
        await conn.rollback();
        console.error('월간 랭킹 업데이트 실패:', err);
    } finally {
        if (conn) conn.release();
    }
}

// 필요에 따라 함수들을 내보내거나, 이 파일 내에서 스케줄링 로직을 추가할 수 있습니다.
module.exports = {
    updateDailyRanking,
    updateWeeklyRanking,
    updateMonthlyRanking
};
