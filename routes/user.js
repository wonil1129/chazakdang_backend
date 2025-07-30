const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');

// Register
router.post('/register', async (req, res) => {
    const { user_id, user_pw, user_name } = req.body;
    if (!user_id || !user_pw || !user_name)
        return res.status(400).json({ msg: 'All fields required' });

    try {
        const hashedPw = await bcrypt.hash(user_pw, 10);
        const sql = `INSERT INTO user (user_id, user_pw, user_name) VALUES (?, ?, ?)`;
        db.query(sql, [user_id, hashedPw, user_name], (err, result) => {
            if (err) return res.status(500).json({ msg: 'Register failed', err });
            return res.status(201).json({ msg: 'User registered' });
        });
    } catch (err) {
        return res.status(500).json({ msg: 'Server error', err });
    }
});

// Login
router.post('/login', (req, res) => {
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
});

module.exports = router;
