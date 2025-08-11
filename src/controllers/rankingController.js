const db = require('../../config/db');
const express = require('express');
const router = express.Router();


exports.dailyRanking = (req, res) => {
    const user_id = req.user.id; // assuming user ID comes from auth middleware

    const sql = `
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
    db.query(sql, [user_id], (err, results) => {
        if (err || results.length === 0) {
            return res.status(500).json({ msg: '일간 랭킹 조회에 실패했습니다.', err });
        }

        // Separate top 10 and requesting user's rank

        const dailyRanking = results
            .filter(r => r.user_rank <= 10)
            .map(r => ({
                rank: r.user_rank,
                user_name: r.user_name,
                profile_image: r.profile_image,
                daily_score: r.daily_score
            }));

        const userRanking = results.find(r => r.user_id == user_id);

        res.json({ dailyRanking, userRanking });
    });
};



exports.weeklyRanking = (req, res) => {
    const user_id = req.user.id; // assuming user ID comes from auth middleware

    const sql = `
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

    db.query(sql, [user_id], (err, results) => {
        if (err || results.length === 0) {
            return res.status(500).json({ msg: '주간 랭킹 조회에 실패했습니다.', err });
        }

        // Separate top 10 and requesting user's rank
        const weeklyRanking = results
            .filter(r => r.user_rank <= 10)
            .map(r => ({
                rank: r.user_rank,
                user_name: r.user_name,
                profile_image: r.profile_image,
                weekly_score: r.weekly_score
            }));

        // const userRanking = results.find(r => r.user_id === user_id);
        const userRanking = results[0];

        res.json({ weeklyRanking, userRanking });
    });
};


exports.monthlyRanking = (req, res) => {
    const user_id = req.user.id; // assuming user ID comes from auth middleware

    const sql = `
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

    db.query(sql, [user_id], (err, results) => {
        if (err || results.length === 0) {
            return res.status(500).json({ msg: '월간 랭킹 조회에 실패했습니다.', err });
        }

        // Separate top 10 and requesting user's rank
        const monthlyRanking = results
            .filter(r => r.user_rank <= 10)
            .map(r => ({
                rank: r.user_rank,
                user_name: r.user_name,
                profile_image: r.profile_image,
                monthly_score: r.monthly_score
            }));

        const userRanking = results.find(r => r.user_id === user_id);

        res.json({ monthlyRanking, userRanking });
    });
};