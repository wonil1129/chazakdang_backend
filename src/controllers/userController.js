const db = require('../../config/db');
const { hashPassword, verifyPassword } = require('../utils/hash');

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/auth');

// Register user
exports.register = async (req, res) => {
    console.log('Registering user:', req.body);
    const { user_id, user_pw, user_name, age, height, weight, sex, preg, dis } = req.body;
    if (!user_id || !user_pw || !user_name)
        return res.status(400).json({ msg: 'All fields required' });

    try {
        const hashedPw = await bcrypt.hash(user_pw, 10);
        const sql = `INSERT INTO user (user_id, user_pw, user_name, registration_date) VALUES (?, ?, ?, NOW())`;
        const sql2 = 'INSERT INTO user_info (user_id, age, height, weight, sex, preg, dis) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const sql3 = 'INSERT INTO eating_history (user_id) VALUES (?)';

        db.query(sql, [user_id, hashedPw, user_name], (err, result) => {
            if (err) return res.status(500).json({ msg: 'Register failed', err });
            
            // user 테이블 성공 후 user_info 테이블 처리
            db.query(sql2, [user_id, age, height, weight, sex, preg, dis], (err2) => {
                if (err2) return res.status(500).json({ msg: 'Failed to create user info', err2 });

                // JWT Token 생성
                const token = jwt.sign(
                  { id: user_id, name: user_name },
                  process.env.JWT_SECRET,
                  { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
                );

                return res.status(201).json({
                  msg: 'User registered successfully',
                  token
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

        // JWT Token 생성
        const token = jwt.sign(
          { id: user.user_id, name: user.user_name },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );

        res.json({
          msg: 'Login successful',
          token,
          user: { id: user.user_id, name: user.user_name },
        });
    });
};

// Get user profile
exports.getProfile = (req, res) => {
    const userId = req.user.id; // JWT에서 추출한 user ID
    const sql = `SELECT user_id, user_name FROM user WHERE user_id = ?`;

    db.query(sql, [userId], (err, results) => {
        if (err || results.length === 0)
            return res.status(404).json({ msg: 'User not found' });

        const user = results[0];
        res.json({
            id: user.user_id,
            name: user.user_name,
        });
    });
}

exports.uploadProfileImage = (req, res) => {
  const user_id = req.user.id; // JWT에서 추출한 user ID
  const imagePath = `uploads/profile_images/${req.file.filename}`;

  const sql = 'UPDATE user SET profile_image = ? WHERE user_id = ?';
  
  db.query(sql, [imagePath, user_id], (err) => {
    if(err) {
      return res.status(500).json({ msg: 'Failed to upload profile image', err });
    }
    res.json({ msg: 'Profile image uploaded successfully', image_url: imagePath });
  });
};

exports.uploadProductImage = (req, res) => {
  const user_id = req.user.id; // JWT에서 추출한 user ID
  const food_name = "제로콜라";
  const calories = 0;
  const protien = 0;
  const fat = 0;
  const carbohydrate = 0;
  const sugar = 0;
  const sodium = 0;
  const cholestrol = 0;
  const saturated_fat = 0;
  const trans_fat = 0;
  const food_weight = 0; // Assuming this is a placeholder value
  const product_image = `uploads/product_images/${req.file.filename}`;
  const nutrient_image = `uploads/nutrient_images/placeholder.png`; // Placeholder for nutrient image


  const sql = 'INSERT INTO eating_history (user_id, eating_time, food_name, calories, protien, fat, carbohydrate, sugar, sodium, cholestrol, saturated_fat, trans_fat, food_weight, product_image, nutrient_image) VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  


  db.query(sql, [user_id, food_name, calories, protien, fat, carbohydrate, sugar, sodium, cholestrol, saturated_fat, trans_fat, food_weight, product_image, nutrient_image], (err) => {
    if(err) {
      return res.status(500).json({ msg: 'Failed to upload profile image', err });
    }
    res.json({ msg: 'Product image uploaded successfully' });
  });
};


// Get detailed user info for calendar
exports.getDetailedProfile = (req, res) => {
  console.log('Fetching detailed profile for user:', req.user.id);
  const userId = req.user.id;
  const sql = `
    SELECT u.user_id, u.user_name, u.profile_image, u.registration_date, ui.age, ui.height, ui.weight, ui.sex, ui.preg, ui.dis
    FROM user u
    JOIN user_info ui ON u.user_id = ui.user_id
    WHERE u.user_id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ msg: 'Database error', err });
    if (results.length === 0) return res.status(404).json({ msg: 'User not found' });

    const user = results[0];
    res.json({
      id: user.user_id,
      name: user.user_name,
      profile_image: user.profile_image,
      registration_date: user.registration_date,
      age: user.age,
      height: user.height,
      weight: user.weight,
      sex: user.sex,
      preg: user.preg,
      dis: user.dis,
    });
  });
};

exports.deleteAccount = (req, res) => {
  console.log('Deleting account for user:', req.user.id);
  const userId = req.user.id;

  const deleteHistory = 'DELETE FROM eating_history WHERE user_id = ?';
  const deleteInfo = 'DELETE FROM user_info WHERE user_id = ?';
  const deleteUser = 'DELETE FROM user WHERE user_id = ?';

  // 1. 섭취 이력 삭제
  db.query(deleteHistory, [userId], (err1) => {
    if (err1) return res.status(500).json({ msg: 'Failed to delete eating history', err1 });

    // 2. 신체 정보 삭제
    db.query(deleteInfo, [userId], (err2) => {
      if (err2) return res.status(500).json({ msg: 'Failed to delete user info', err2 });

      // 3. 유저 정보 삭제
      db.query(deleteUser, [userId], (err3) => {
        if (err3) return res.status(500).json({ msg: 'Failed to delete user', err3 });

        res.json({ msg: '회원 탈퇴가 완료되었습니다.' });
      });
    });
  });
};
