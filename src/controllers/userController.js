const db = require('../../config/db');
const { hashPassword, verifyPassword } = require('../utils/hash');

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

// Register user
exports.register = async (req, res) => {
    const { user_id, user_pw, user_name } = req.body;
    if (!user_id || !user_pw || !user_name)
        return res.status(400).json({ msg: 'All fields required' });

    try {
        const hashedPw = await bcrypt.hash(user_pw, 10);
        const sql = `INSERT INTO user (user_id, user_pw, user_name) VALUES (?, ?, ?)`;
        const sql2 = 'INSERT INTO user_info (user_id) VALUES (?)';
        const sql3 = 'INSERT INTO eating_history (user_id) VALUES (?)';

        db.query(sql, [user_id, hashedPw, user_name], (err, result) => {
            if (err) return res.status(500).json({ msg: 'Register failed', err });
            
            // user 테이블 성공 후 user_info 테이블 처리
            db.query(sql2, [user_id], (err2) => {
                if (err2) return res.status(500).json({ msg: 'Failed to create user info', err2 });
                
                // user_info 성공 후 eating_history 테이블 처리
                db.query(sql3, [user_id], (err3) => {
                    if (err3) return res.status(500).json({ msg: 'Failed to create eating history', err3 });
                    
                    // 모든 테이블 삽입 성공
                    return res.status(201).json({ msg: 'User registered successfully' });
                });
            });
        });
    } catch (err) {
        return res.status(500).json({ msg: 'Server error', err });
    }
};

// Login user
exports.login = async (req, res) => {
  const { user_id, user_pw } = req.body;
    if (!user_id || !user_pw)
        return res.status(400).json({ msg: 'All fields required' });

    const sql = `SELECT * FROM user WHERE user_id = ?`;
    db.query(sql, [user_id], async (err, results) => {
        if (err || results.length === 0)
            return res.status(401).json({ msg: 'Invalid credentials' });

        const user = results[0];
        const match = await bcrypt.compare(user_pw, user.user_pw);
        if (!match) return res.status(401).json({ msg: 'Invalid credentials' });

        res.json({ msg: 'Login successful', user: { id: user.user_id, name: user.user_name } });
    });
};