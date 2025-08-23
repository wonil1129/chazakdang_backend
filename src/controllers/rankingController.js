const pool = require('../../config/db');
const { updateDailyRanking, updateWeeklyRanking, updateMonthlyRanking } = require('../services/rankingUpdater');

// Query helper using pool
const query = (sql, params) => pool.promise().query(sql, params);

/**
 * Fetches rankings based on a specified period (daily, weekly, monthly).
 * It returns the top 10 users and the current user's rank.
 */
exports.getRankingByPeriod = async (req, res) => {
    const { period } = req.query;
    const userId = req.user.id;

    let sql;
    let updateFunction;
    let scoreColumn;
    let noDataMessage;

    // Determine the correct SQL query and settings based on the period
    switch (period) {
        case 'daily':
            scoreColumn = 'daily_score';
            noDataMessage = '오늘의 랭킹 데이터가 아직 없습니다.';
            updateFunction = updateDailyRanking;
            sql = `
                WITH ranked AS (
                    SELECT a.user_id, a.user_name, a.profile_image, b.score AS ${scoreColumn},
                           RANK() OVER (ORDER BY b.score DESC, b.user_id ASC) AS user_rank
                    FROM user a JOIN ranking_log b ON a.user_id = b.user_id
                    WHERE b.ranking_type = 'daily' AND b.rank_date = CURDATE()
                )
                SELECT * FROM ranked WHERE user_rank <= 10 OR user_id = ? ORDER BY user_rank;
            `;
            break;

        case 'weekly':
            scoreColumn = 'weekly_score';
            noDataMessage = '이번 주의 랭킹 데이터가 아직 없습니다.';
            updateFunction = updateWeeklyRanking;
            sql = `
                WITH ranked AS (
                    SELECT a.user_id, a.user_name, a.profile_image, b.score AS ${scoreColumn},
                           RANK() OVER (ORDER BY b.score DESC, b.user_id ASC) AS user_rank
                    FROM user a JOIN ranking_log b ON a.user_id = b.user_id
                    WHERE b.ranking_type = 'weekly' AND b.rank_date = DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
                )
                SELECT * FROM ranked WHERE user_rank <= 10 OR user_id = ? ORDER BY user_rank;
            `;
            break;

        case 'monthly':
            scoreColumn = 'monthly_score';
            noDataMessage = '이번 달 랭킹 데이터가 아직 없습니다.';
            updateFunction = updateMonthlyRanking;
            sql = `
                WITH ranked AS (
                    SELECT a.user_id, a.user_name, a.profile_image, b.score AS ${scoreColumn},
                           RANK() OVER (ORDER BY b.score DESC, b.user_id ASC) AS user_rank
                    FROM user a JOIN ranking_log b ON a.user_id = b.user_id
                    WHERE b.ranking_type = 'monthly' AND b.rank_date = DATE_FORMAT(CURDATE(), '%Y-%m-01')
                )
                SELECT * FROM ranked WHERE user_rank <= 10 OR user_id = ? ORDER BY user_rank;
            `;
            break;

        default:
            return res.status(400).json({ msg: 'Invalid period specified. Use "daily", "weekly", or "monthly".' });
    }

    try {
        // First attempt to fetch rankings
        let [results] = await query(sql, [userId]);

        // If no rankings exist, try to generate them and fetch again
        if (results.length === 0) {
            console.log(`${period} 랭킹 정보가 없습니다. 랭킹 업데이트를 시도합니다.`);
            await updateFunction();
            [results] = await query(sql, [userId]);
        }

        // If there's still no data, return an empty response
        if (results.length === 0) {
            return res.json({
                msg: noDataMessage,
                top_10: [],
                my_rank: null
            });
        }

        // Format the top 10 list
        const top_10 = results
            .filter(r => r.user_rank <= 10)
            .map(r => ({
                rank: r.user_rank,
                user_name: r.user_name,
                profile_image: r.profile_image,
                score: r[scoreColumn] // Use the dynamic score column name
            }));

        // Find the current user's rank information
        const myRankData = results.find(r => r.user_id === userId);
        const my_rank = myRankData ? {
            rank: myRankData.user_rank,
            user_name: myRankData.user_name,
            profile_image: myRankData.profile_image,
            score: myRankData[scoreColumn]
        } : null;

        // Send the final response
        res.json({ top_10, my_rank });

    } catch (err) {
        console.error(`${period} 랭킹 조회 중 오류 발생:`, err);
        res.status(500).json({ msg: `${period} 랭킹 조회 중 서버 오류가 발생했습니다.`, err: err.message });
    }
};


/* old code
const pool = require('../../config/db');
const { updateDailyRanking, updateWeeklyRanking, updateMonthlyRanking } = require('../services/rankingUpdater');

// Query helper using pool
const query = (sql, params) => pool.promise().query(sql, params);

exports.getRankingByPeriod = async (req, res) => {
    res.json({ msg: "test" });
};

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
        let [results] = await query(getDailyRankingSql, [user_id]);

        if (results.length === 0) {
            console.log('일간 랭킹 정보가 없습니다. 랭킹 업데이트를 시도합니다.');
            await updateDailyRanking();
            [results] = await query(getDailyRankingSql, [user_id]);
        }

        if (results.length === 0) {
            return res.json({
                msg: '오늘의 랭킹 데이터가 아직 없습니다.',
                dailyRanking: [],
                userRanking: null
            });
        }

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
    const user_id = req.user.id;

    const getWeeklyRankingSql = `
        WITH ranked AS (
            SELECT
                a.user_id,
                a.user_name,
                a.profile_image,
                b.score AS weekly_score,
                RANK() OVER (ORDER BY b.score DESC, b.user_id ASC) AS user_rank
            FROM user a
            JOIN ranking_log b ON a.user_id = b.user_id
            WHERE b.ranking_type = 'weekly'
              AND b.rank_date = DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
        )
        SELECT *
        FROM ranked
        WHERE user_rank <= 10 OR user_id = ?
        ORDER BY user_rank
    `;

    try {
        let [results] = await query(getWeeklyRankingSql, [user_id]);

        if (results.length === 0) {
            console.log('주간 랭킹 정보가 없습니다. 랭킹 업데이트를 시도합니다.');
            await updateWeeklyRanking();
            [results] = await query(getWeeklyRankingSql, [user_id]);
        }

        if (results.length === 0) {
            return res.json({
                msg: '이번 주의 랭킹 데이터가 아직 없습니다.',
                weeklyRanking: [],
                userRanking: null
            });
        }

        const weeklyRanking = results
            .filter(r => r.user_rank <= 10)
            .map(r => ({
                rank: r.user_rank,
                user_name: r.user_name,
                profile_image: r.profile_image,
                weekly_score: r.weekly_score
            }));

        const userRanking = results.find(r => r.user_id === user_id) || null;

        res.json({ weeklyRanking, userRanking });
    } catch (err) {
        console.error('주간 랭킹 조회 중 오류 발생:', err);
        res.status(500).json({ msg: '주간 랭킹 조회 중 서버 오류가 발생했습니다.', err: err.message });
    }
};

exports.monthlyRanking = async (req, res) => {
    const user_id = req.user.id;

    const getMonthlyRankingSql = `
        WITH ranked AS (
            SELECT
                a.user_id,
                a.user_name,
                a.profile_image,
                b.score AS monthly_score,
                RANK() OVER (ORDER BY b.score DESC, b.user_id ASC) AS user_rank
            FROM user a
            JOIN ranking_log b ON a.user_id = b.user_id
            WHERE b.ranking_type = 'monthly'
              AND b.rank_date = DATE_FORMAT(CURDATE(), '%Y-%m-01')
        )
        SELECT *
        FROM ranked
        WHERE user_rank <= 10 OR user_id = ?
        ORDER BY user_rank
    `;

    try {
        let [results] = await query(getMonthlyRankingSql, [user_id]);

        if (results.length === 0) {
            console.log('월간 랭킹 정보가 없습니다. 랭킹 업데이트를 시도합니다.');
            await updateMonthlyRanking();
            [results] = await query(getMonthlyRankingSql, [user_id]);
        }

        if (results.length === 0) {
            return res.json({
                msg: '이번 달 랭킹 데이터가 아직 없습니다.',
                monthlyRanking: [],
                userRanking: null
            });
        }

        const monthlyRanking = results
            .filter(r => r.user_rank <= 10)
            .map(r => ({
                rank: r.user_rank,
                user_name: r.user_name,
                profile_image: r.profile_image,
                monthly_score: r.monthly_score
            }));

        const userRanking = results.find(r => r.user_id === user_id) || null;

        res.json({ monthlyRanking, userRanking });
    } catch (err) {
        console.error('월간 랭킹 조회 중 오류 발생:', err);
        res.status(500).json({ msg: '월간 랭킹 조회 중 서버 오류가 발생했습니다.', err: err.message });
    }
};
*/