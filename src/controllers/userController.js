const { hashPassword, verifyPassword } = require('../utils/hash');
const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const nutrientService = require('../services/nutrientService');
const productService = require('../services/productService');
const path = require('path');
// const { createToken } = require('../middleware/auth');
const auth = require('../middleware/auth');
const db = require('../../config/db');
const predictionService = require('../services/predictionService');
const { analyzeFoodItem } = require('../services/health_scorer.js');
const searchFoodData = require('../utils/searchFoodData.js');

exports.checkDuplicateId = async (req, res) => {
  const user_id = req.body.user_id;
  try {
    const isDuplicate = await userService.checkDuplicateId(user_id);
    if (isDuplicate) {
      return res.status(409).json({ msg: 'ID already exists' });
    }
    res.json({ msg: 'ID is available' });
  } catch (error) {
    console.error('Error checking duplicate ID:', error);
    res.status(500).json({ msg: 'Error checking duplicate ID' });
  }
};

// Register user
exports.register = async (req, res) => {
    console.log('Registering user:', req.body);
    const { user_id, user_pw, user_name, age, height, weight, sex, preg, dis } = req.body;
    if (!user_id || !user_pw || !user_name){
        return res.status(400).json({ msg: 'All fields required' });
    }
    try {
        const isDuplicate = await userService.checkDuplicateId(user_id);
        if (isDuplicate) {
          return res.status(409).json({ msg: 'ID already exists' });
        }

        const hashedPw = await hashPassword(user_pw);

        db.beginTransaction();
        await userService.createUser(user_id, hashedPw, user_name);
        await userService.createUserInfo(user_id, age, height, weight, sex, preg, dis);
        db.commit();

        const token = auth.createToken(user_id, user_name);

        return res.status(201).json({
          msg: 'User registered successfully',
          token,
        });
    } catch (err) {
      console.error('Register error:', err);
      return res.status(500).json({ msg: 'Register failed', error: err.message || err });
    }
};

// Login user
exports.login = async (req, res) => {
  const { user_id, user_pw } = req.body;
    if (!user_id || !user_pw) return res.status(400).json({ msg: 'All fields required' });

    try {
      const user = await userService.getUserById(user_id);
      if (!user) return res.status(404).json({ msg: 'User not found' });
      const match = await verifyPassword(user_pw, user.user_pw);
      if (!match) return res.status(401).json({ msg: 'Invalid credentials' });
      const token = auth.createToken(user.user_id, user.user_name);
      res.json({
        msg: 'Login successful',
        token,
        user: { id: user.user_id, name: user.user_name },
      });
    } catch (error) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }
};

// Get user profile
exports.getProfile = async (req, res) => {
    const userId = req.user.id;

    try {
      const user = await userService.getUserById(userId);
      if (!user) return res.status(404).json({ msg: 'User not found' });
      res.json({
        id: user.user_id,
        name: user.user_name,
        profile_image: user.profile_image,
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return res.status(500).json({ msg: 'Error fetching user profile' });
    }
};

exports.getTodaySummary = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await userService.getUserById(userId);
    const summary = await userService.getTodaySummary(userId);

    return res.json({
      name: user?.user_name || '',
      avg_health_score: summary.avg_health_score,
      totals: {
        sugar_g: summary.sugar_g,
        calories_kcal: summary.calories_kcal,
      },
    });
  } catch (error) {
    console.error('Error fetching today summary:', error);
    return res.status(500).json({ msg: 'Error fetching today summary' });
  }
};

exports.uploadProfileImage = async (req, res) => {
  const user_id = req.user.id; // JWT에서 추출한 user ID
  const imagePath = `uploads/profile_images/${req.file.filename}`;

  try {
    await userService.updateProfileImage(user_id, imagePath);
    return res.json({ msg: 'Profile image uploaded successfully', image_url: imagePath });
  } catch (error) {
    return res.status(500).json({ msg: 'Error uploading profile image' });
  }
};

exports.uploadNutrientsImage = async (req, res) => {
  const user_id = req.user.id;
  const nutrient_image = `uploads/nutrients_images/${req.file.filename}`;
  let prediction = { predicted_value: 'NaN' };

  try {
    const userInfo = await userService.getUserDetailedInfo(req.user.id);
    let nutrientData = await nutrientService.analyzeNutrients(req.file.path, userInfo);
    // const product_image = await productService.fetchProductImage(nutrientData.food_name) || 'uploads/product_images/placeholder.jpg';
    const product_image = 'uploads/product_images/placeholder.jpg'; // Placeholder for product image

    // 품목보고번호로 식품정보 가져오는 함수 호출
    try {
      nutrientData = await searchFoodData.getFoodDataFromProductID(nutrientData);
    } catch (error) {
      console.error(error);
    }

    try {
      console.log('Sending data to Python script for prediction:', nutrientData);
      prediction = await predictionService.runPrediction(nutrientData);
      console.log("prediction: ", prediction);
    } catch (error) {
      console.error('Error running prediction:', error);
      prediction = { predicted_value: 'NaN' };
    }

    await userService.insertEatingHistory(user_id, {
      ...nutrientData,
      product_image,
      nutrient_image,
      health_score: prediction.predicted_value || -1,
      // health_score: prediction.score || '-1',
    });

    res.json({
      msg: 'Nutrients image uploaded successfully',
      analyzeResult: nutrientData,
      // coupang: product_image.includes('placeholder') ? { msg: 'No product image found' } : product_image,
      coupang: nutrient_image.includes('placeholder') ? { msg: 'No product image found' } : nutrient_image,
      // health_score: prediction.predicted_value || 'NaN',
      health_score: prediction.predicted_value || 'NaN',
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ msg: 'Failed to upload nutrients image'});
  }
};


// Get detailed user info for calendar
exports.getDetailedProfile = async (req, res) => {
  console.log('Fetching detailed profile for user:', req.user.id);
  const userId = req.user.id;

  try {
    const userinfo = await userService.getUserDetailedInfo(userId);
    if (!userinfo) return res.status(404).json({ msg: 'User not found' });
    res.json({
      id: userinfo.user_id,
      name: userinfo.user_name,
      profile_image: userinfo.profile_image,
      registration_date: userinfo.registration_date,
      age: userinfo.age,
      height: userinfo.height,
      weight: userinfo.weight,
      sex: userinfo.sex,
      preg: userinfo.preg,
      dis: userinfo.dis,
    });
  } catch (error) {
    console.error('Error fetching detailed profile:', error);
    return res.status(500).json({ msg: 'Error fetching detailed profile' });
  }
};

// 특정 날짜의 섭취 기록 조회
exports.getEatingHistoryByDate = async (req, res) => {
  const userId = req.user.id;
  const { date } = req.query; // YYYY-MM-DD 형태로 프론트에서 넘김

  if (!date) return res.status(400).json({ msg: 'Date is required' });

  try {
    const eatingHistory = await userService.getEatingHistoryByIdAndDate(userId, date);
    if (!eatingHistory || eatingHistory.length === 0) {
      return res.status(404).json({ msg: 'No eating history found for this date' });
    }
    res.json({ date, records: eatingHistory });
  } catch (error) {
    console.error('Error fetching eating history:', error);
    return res.status(500).json({ msg: 'Error fetching eating history' });
  }
};

exports.getRecentEatingHistory = async (req, res) => {
  console.log("req:", req.body.limit);
  const userId = req.user.id;
  const limit = req.body.limit;

  try {
    const recentEatingHistory = await userService.getRecentEatingHistory(userId, limit);
    if (!recentEatingHistory || recentEatingHistory.length === 0) {
      return res.status(404).json({ msg: 'No recent eating history found' });
    }
    return res.json({ msg: 'Successfully fetched recent eating history', recentEatingHistory: recentEatingHistory });
  } catch (error) {
    console.error('Error fetching recent eating history:', error);
    return res.status(500).json({ msg: 'Error fetching recent eating history '});
  }
};


exports.deleteAccount = async (req, res) => {
  console.log('Deleting account for user:', req.user.id);
  const userId = req.user.id;

  try {
    await userService.deleteUser(userId);
    console.log('User account deleted successfully');
    res.json({ msg: 'Account deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user account:', error);
    return res.status(500).json({ msg: 'Error deleting user account' });
  }
};

exports.updateUserInfo = async (req, res) => {
  console.log('Updating user info for user:', req.user.id);
  const user_id = req.user.id;
  const { user_name, age, height, weight, sex, preg, dis } = req.body;

  if (!user_name || !age || !height || !weight || !sex || !preg) {
    return res.status(400).json({ msg: 'All fields except disease are required' });
  }

  try {
    await userService.updateUserName(user_id, user_name);
    await userService.updateUserInfo(user_id, age, height, weight, sex, preg, dis);
    return res.json({ msg: 'User info updated successfully' });
  } catch (error) {
    console.error('Error updating user info:', error);
    return res.status(500).json({ msg: 'Error updating user info' });
  }
  
};
