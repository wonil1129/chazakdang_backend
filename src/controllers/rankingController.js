const db = require('../../config/db');
const express = require('express');
const router = express.Router();


exports.dailyRanking = (req, res) => {
    const sql = `SELECT a.user_name, a.profile_image, AVG(b.health_score) AS daily_score
                FROM user a
                JOIN eating_history b ON a.user_id = b.user_id
                WHERE DATE(b.eat_time) = CURDATE()
                GROUP BY a.user_id, a.user_name, a.profile_image
                ORDER BY daily_score DESC
                LIMIT 10`;
    db.query(sql, (err, results) => {
        if(err || results.length == 0) {return res.status(500).json({ msg: '일간 랭킹 조회에 실패했습니다.', err });}

        const dailyRanking = results.map((row, index) => ({
            rank: index + 1,
            user_name: row.user_name,
            profile_image: row.profile_image,
            daily_score: row.daily_score
        }));

        res.json({ dailyRanking });
    });
};


exports.weeklyRanking = (req, res) => {
    const sql = `SELECT a.user_name, a.profile_image, AVG(b.health_score) AS weekly_score
                FROM user a
                JOIN eating_history b ON a.user_id = b.user_id
                WHERE YEARWEEK(b.eat_time, 0) = YEARWEEK(CURDATE(), 0)
                GROUP BY a.user_id, a.user_name, a.profile_image
                ORDER BY weekly_score DESC
                LIMIT 10`;
    db.query(sql, (err, results) => {
        if(err || results.length == 0) {return res.status(500).json({ msg: '주간 랭킹 조회에 실패했습니다.', err });}

        const weeklyRanking = results.map((row, index) => ({
            rank: index + 1,
            user_name: row.user_name,
            profile_image: row.profile_image,
            weekly_score: row.weekly_score
        }));
        
        res.json({ weeklyRanking });
    });

};


exports.monthlyRanking = (req, res) => {
    const sql = `SELECT a.user_name, a.profile_image, AVG(b.health_score) AS monthly_score
                FROM user a
                JOIN eating_history b ON a.user_id = b.user_id
                WHERE MONTH(b.eat_time) = MONTH(CURDATE())
                AND YEAR(b.eat_time) = YEAR(CURDATE())
                GROUP BY a.user_id, a.user_name, a.profile_image
                ORDER BY monthly_score DESC
                LIMIT 10`;
    db.query(sql, (err, results) => {
        if(err || results.length == 0) {return res.status(500).json({ msg: '월간 랭킹 조회에 실패했습니다.', err });}

        const monthlyRanking = results.map((row, index) => ({
            rank: index + 1,
            user_name: row.user_name,
            profile_image: row.profile_image,
            monthly_score: row.monthly_score
        }));
        
        res.json({ monthlyRanking });
    });

};