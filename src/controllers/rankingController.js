const db = require('../../config/db');
// Import the updater functions to be called on-demand
const { updateDailyRanking, updateWeeklyRanking, updateMonthlyRanking } = require('../services/rankingUpdater');

/**
 * Helper function to perform a database query using promises.
 * This assumes your 'db' object is from a library like 'mysql2'.
 */
const query = (sql, params) => db.promise().query(sql, params);


exports.dailyRanking = async (req, res) => {
    const user_id = req.user.id;

    const getDailyRankingSql = `
        WITH ranked AS (
            SELECT
                a.user_id,
                a.user_name,
                a.profile_image,
                b.score AS daily_score,
                RANK() OVER (ORDER BY b.score DESC, b.user_id ASC) AS user_rank
            FROM user a
            JOIN ranking_log b ON a.user_id = b.user_id
            WHERE b.ranking_type = 'daily'
              AND b.rank_date = CURDATE()
        )
        SELECT *
        FROM ranked
        WHERE user_rank <= 10 OR user_id = ?
        ORDER BY user_rank
    `;

    try {
        // 1. First attempt to get the ranking
        let [results] = await query(getDailyRankingSql, [user_id]);

        // 2. If no results, run the updater and try again
        if (results.length === 0) {
            console.log('일간 랭킹 정보가 없습니다. 랭킹 업데이트를 시도합니다.');
            await updateDailyRanking(); // Run the update logic

            // 3. Second attempt to get the ranking
            [results] = await query(getDailyRankingSql, [user_id]);
        }
        
        // If results are still empty, it means there's no eating_history data for today.
        // Send a successful response with empty data.
        if (results.length === 0) {
            return res.json({ 
                msg: '오늘의 랭킹 데이터가 아직 없습니다.', 
                dailyRanking: [], 
                userRanking: null 
            });
        }

        // 4. Process and send the results
        const dailyRanking = results
            .filter(r => r.user_rank <= 10)
            .map(r => ({
                rank: r.user_rank,
                user_name: r.user_name,
                profile_image: r.profile_image,
                daily_score: r.daily_score
            }));

        const userRanking = results.find(r => r.user_id === user_id) || null;

        res.json({ dailyRanking, userRanking });

    } catch (err) {
        console.error('일간 랭킹 조회 중 오류 발생:', err);
        res.status(500).json({ msg: '일간 랭킹 조회 중 서버 오류가 발생했습니다.', err: err.message });
    }
};


exports.weeklyRanking = async (req, res) => {
    const getWeeklyRankingSql = `
        SELECT a.user_name, a.profile_image, b.score AS weekly_score
        FROM user a
        JOIN ranking_log b ON a.user_id = b.user_id
        WHERE b.ranking_type = 'weekly' 
          AND YEARWEEK(b.rank_date, 1) = YEARWEEK(CURDATE(), 1) -- Using mode 1 for Monday-first week
        ORDER BY weekly_score DESC, b.user_id ASC
        LIMIT 10`;

    try {
        let [results] = await query(getWeeklyRankingSql);

        if (results.length === 0) {
            console.log('주간 랭킹 정보가 없습니다. 랭킹 업데이트를 시도합니다.');
            await updateWeeklyRanking();
            [results] = await query(getWeeklyRankingSql);
        }

        const weeklyRanking = results.map((row, index) => ({
            rank: index + 1,
            user_name: row.user_name,
            profile_image: row.profile_image,
            weekly_score: row.weekly_score
        }));
        
        res.json({ weeklyRanking });

    } catch (err) {
        console.error('주간 랭킹 조회 중 오류 발생:', err);
        res.status(500).json({ msg: '주간 랭킹 조회에 실패했습니다.', err: err.message });
    }
};


exports.monthlyRanking = async (req, res) => {
    const getMonthlyRankingSql = `
        SELECT a.user_name, a.profile_image, b.score AS monthly_score
        FROM user a
        JOIN ranking_log b ON a.user_id = b.user_id
        WHERE b.ranking_type = 'monthly' 
          AND MONTH(b.rank_date) = MONTH(CURDATE()) 
          AND YEAR(b.rank_date) = YEAR(CURDATE())
        ORDER BY monthly_score DESC, b.user_id ASC
        LIMIT 10`;

    try {
        let [results] = await query(getMonthlyRankingSql);

        if (results.length === 0) {
            console.log('월간 랭킹 정보가 없습니다. 랭킹 업데이트를 시도합니다.');
            await updateMonthlyRanking();
            [results] = await query(getMonthlyRankingSql);
        }

        const monthlyRanking = results.map((row, index) => ({
            rank: index + 1,
            user_name: row.user_name,
            profile_image: row.profile_image,
            monthly_score: row.monthly_score
        }));
        
        res.json({ monthlyRanking });

    } catch (err) {
        console.error('월간 랭킹 조회 중 오류 발생:', err);
        res.status(500).json({ msg: '월간 랭킹 조회에 실패했습니다.', err: err.message });
    }
};