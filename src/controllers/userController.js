const db = require('../../config/db');
const { hashPassword, verifyPassword } = require('../utils/hash');

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/auth');
const gemini = require('../utils/gemini');

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

// check duplicate ID
exports.checkDuplicateId = (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ msg: 'user_id is required' });

  const sql = 'SELECT user_id FROM user WHERE user_id = ?';
  db.query(sql, [user_id], (err, results) => {
    if (err) return res.status(500).json({ msg: 'Database error', err });
    if (results.length > 0) return res.status(409).json({ msg: 'ID already exists' });
    return res.json({ msg: 'ID is available' });
  });
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

exports.uploadNutrientsImage = async (req, res) => {
  let geminiResult = "error";

  try {
    geminiResult = await gemini.analyzeNutrients(req.file.path, "user has no disease");

    if(typeof geminiResult === 'string') {
      console.log('Gemini API returned string, parsing as JSON');
      geminiResult = JSON.parse(geminiResult);
    }

    
    // Use geminiResult to fill in nutrition info
  } catch (err) {
    console.error('Gemini API error:', err);
    return res.status(500).json({ msg: 'Gemini API error', err });
  }

  const user_id = req.user.id; // JWT에서 추출한 user ID
  const food_name = geminiResult.food_name || '알 수 없음';
  const calories = geminiResult.calories || 0;
  const protein = geminiResult.protein || 0;
  const fat = geminiResult.fat || 0;
  const carbohydrate = geminiResult.carbohydrate || 0;
  const sugar = geminiResult.sugar || 0;
  const sodium = geminiResult.sodium || 0;
  const cholesterol = geminiResult.cholesterol || 0;
  const saturated_fat = geminiResult.saturated_fat || 0;
  const trans_fat = geminiResult.trans_fat || 0;
  const food_weight = geminiResult.food_weight || '0g';
  const nutrient_list = geminiResult.ingredients || '';
  const rating = geminiResult.rating || 1; // Default to 1 if not provided
  const review_text = geminiResult.review_text || '리뷰 없음';
  const product_image = `uploads/product_images/${req.file.filename}`;
  const nutrient_image = `uploads/nutrient_images/placeholder.png`; // Placeholder for nutrient image


  const sql = 'INSERT INTO eating_history (user_id, eating_time, food_name, calories, protein, fat, carbohydrate, sugar, sodium, cholesterol, saturated_fat, trans_fat, food_weight, product_image, nutrient_image, nutrient_list, rating, review_text) VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  


  db.query(sql, [user_id, food_name, calories, protein, fat, carbohydrate, sugar, sodium, cholesterol, saturated_fat, trans_fat, food_weight, product_image, nutrient_image, nutrient_list, rating, review_text], (err) => {
    if(err) {
      return res.status(500).json({ msg: 'Failed to upload profile image', err });
    }
    res.json({ msg: 'Product image uploaded successfully', analyzeResult: geminiResult });
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

// 특정 날짜의 섭취 기록 조회
exports.getEatingHistoryByDate = (req, res) => {
  const userId = req.user.id;
  const { date } = req.query; // YYYY-MM-DD 형태로 프론트에서 넘김

  if (!date) return res.status(400).json({ msg: 'Date is required' });

  const sql = `
    SELECT eating_time, food_name, calories, protein, fat, carbohydrate, sugar, sodium
    FROM eating_history
    WHERE user_id = ? AND DATE(eating_time) = ?
    ORDER BY eating_time ASC
  `;

  db.query(sql, [userId, date], (err, results) => {
    if (err) return res.status(500).json({ msg: 'DB error', err });
    res.json({ date, records: results });
  });
};

exports.deleteAccount = (req, res) => {
  console.log('Deleting account for user:', req.user.id);
  const userId = req.user.id;
  const sql = 'DELETE FROM user WHERE user_id = ?';

  db.query(sql, [userId], (err) => {
    if (err) return res.status(500).json({ msg: 'Failed to delete account', err });
    res.json({ msg: 'Account deleted successfully. Please logout now.' });
  })
};

exports.updateUserInfo = (req, res) => {
  const userId = req.user.id;
  const { user_name, age, height, weight, sex, preg, dis } = req.body;

  if (!user_name || !age || !height || !weight || !sex || !preg) {
    return res.status(400).json({ msg: 'All fields except disease are required' });
  }

  const updateUserSql = `UPDATE user SET user_name = ? WHERE user_id = ?`;
  const updateInfoSql = `
    UPDATE user_info 
    SET age = ?, height = ?, weight = ?, sex = ?, preg = ?, dis = ? 
    WHERE user_id = ?
  `;

  // user_name update
  db.query(updateUserSql, [user_name, userId], (err1) => {
    if (err1) return res.status(500).json({ msg: 'Failed to update name', err: err1 });

    // user_info update
    db.query(updateInfoSql, [age, height, weight, sex, preg, dis, userId], (err2) => {
      if (err2) return res.status(500).json({ msg: 'Failed to update user info', err: err2 });

      res.json({ msg: 'User information updated successfully' });
    });
  });
};
