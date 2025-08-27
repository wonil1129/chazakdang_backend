const pool = require('../../config/db');
const { updateDailyRanking, updateWeeklyRanking, updateMonthlyRanking } = require('../services/rankingUpdater');

const query = (sql, params) => pool.promise().query(sql, params);
exports.getRankingByPeriod = async (req, res) => {
    // 1. Destructure 'period' and 'date' from the query parameters.
    const { period, date } = req.query;
    const userId = req.user.id;

    // 2. Determine the target date. Default to today if no date is provided.
    //    The 'isHistoricalQuery' flag helps decide whether to trigger an update later.
    const targetDate = date ? date : new Date().toISOString().slice(0, 10);
    const isHistoricalQuery = !!date;

    let updateFunction;
    let rankDateCondition;
    let sqlParams;
    let noDataMessage;

    // 3. Define a reusable SQL template using a Common Table Expression (CTE).
    //    This avoids repeating the large query block for each case.
    const sqlTemplate = (dateCondition) => `
        WITH ranked AS (
            SELECT 
                a.user_id, 
                a.user_name, 
                a.profile_image, 
                b.score,
                RANK() OVER (ORDER BY b.score DESC, b.user_id ASC) AS user_rank
            FROM user a 
            JOIN ranking_log b ON a.user_id = b.user_id
            WHERE b.ranking_type = ? AND ${dateCondition}
        )
        SELECT * FROM ranked WHERE user_rank <= 10 OR user_id = ? ORDER BY user_rank;
    `;

    // 4. Configure query settings based on the requested 'period'.
    switch (period) {
        case 'daily':
            noDataMessage = '해당 날짜의 랭킹 데이터가 없습니다.';
            updateFunction = updateDailyRanking;
            // For daily, the rank_date is an exact match.
            rankDateCondition = `b.rank_date = ?`;
            sqlParams = [period, targetDate, userId];
            break;

        case 'weekly':
            noDataMessage = '해당 주의 랭킹 데이터가 없습니다.';
            updateFunction = updateWeeklyRanking;
            // For weekly, find the first day of the week (Monday) for the targetDate.
            rankDateCondition = `b.rank_date = DATE_SUB(?, INTERVAL WEEKDAY(?) DAY)`;
            sqlParams = [period, targetDate, targetDate, userId];
            break;

        case 'monthly':
            noDataMessage = '해당 월의 랭킹 데이터가 없습니다.';
            updateFunction = updateMonthlyRanking;
            // For monthly, find the first day of the month for the targetDate.
            rankDateCondition = `b.rank_date = DATE_FORMAT(?, '%Y-%m-01')`;
            sqlParams = [period, targetDate, userId];
            break;

        default:
            return res.status(400).json({ msg: 'Invalid period specified. Use "daily", "weekly", or "monthly".' });
    }

    // Construct the final SQL query from the template and conditions.
    const sql = sqlTemplate(rankDateCondition);

    try {
        // 5. Attempt to fetch the ranking data from the database.
        let [results] = await query(sql, sqlParams);

        // 6. If no data is found AND the request is for the current period (not historical),
        //    try to generate the rankings and fetch the data again.
        if (results.length === 0 && !isHistoricalQuery) {
            console.log(`Current ${period} ranking data is missing. Attempting to update.`);
            await updateFunction();
            [results] = await query(sql, sqlParams); // Re-fetch
        }

        // 7. If there's still no data, return a clean empty response.
        if (results.length === 0) {
            return res.json({
                msg: noDataMessage,
                top_10: [],
                my_rank: null
            });
        }

        // 8. Format the results for the API response.
        //    - Create the top_10 list.
        const top_10 = results
            .filter(r => r.user_rank <= 10)
            .map(r => ({
                rank: r.user_rank,
                user_name: r.user_name,
                profile_image: r.profile_image,
                score: r.score
            }));

        //    - Find the requesting user's rank data.
        const myRankData = results.find(r => r.user_id === userId);
        const my_rank = myRankData ? {
            rank: myRankData.user_rank,
            user_name: myRankData.user_name,
            profile_image: myRankData.profile_image,
            score: myRankData.score
        } : null;

        // 9. Send the final JSON response.
        res.json({ top_10, my_rank });

    } catch (err) {
        console.error(`${period} ranking query error for date ${targetDate}:`, err);
        // Add specific error handling for invalid date formats from MySQL.
        if (err.code === 'ER_TRUNCATED_WRONG_VALUE' || err.code === 'ER_INCORRECT_DATE_VALUE') {
             return res.status(400).json({ msg: 'Invalid date format provided. Please use YYYY-MM-DD.' });
        }
        res.status(500).json({ msg: `An error occurred while fetching the ${period} ranking.`, err: err.message });
    }
};