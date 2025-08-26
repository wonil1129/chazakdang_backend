const { hashPassword, verifyPassword } = require('../utils/hash');
const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const nutrientService = require('../services/nutrientService');
const productService = require('../services/productService');
const path = require('path');
const auth = require('../middleware/auth');
const db = require('../../config/db');
const predictionService = require('../services/predictionService');
const { analyzeFoodItem } = require('../services/health_scorer.js');
const searchFoodData = require('../utils/searchFoodData.js');
const searchRawFoodData = require('../utils/searchRawFoodData.js');
const sweetener_cleaner = require('../utils/sweetener_cleaner.js');
const rankingUpdater = require('../services/rankingUpdater.js');

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

        await userService.createUser(user_id, hashedPw, user_name);
        await userService.createUserInfo(user_id, age, height, weight, sex, preg, dis);

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

// Get user profile (basic info)
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
  const user_id = req.user.id;
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
  const eating_percent = req.body.eating_percent;
  let prediction = { predicted_value: 'NaN' };

  try {
    const userInfo = await userService.getUserDetailedInfo(req.user.id);
    let nutrientData = await nutrientService.analyzeNutrients(req.file.path, userInfo);
    const product_image = 'uploads/product_images/placeholder.jpg';
    try {
      nutrientData = await searchFoodData.getFoodDataFromProductID(nutrientData);
    } catch (error) {
      console.error(error);
    }
    try {
      nutrientData = await searchRawFoodData.getRawFoodDataFromProductID(nutrientData);
    } catch (error) {
      console.error(error);
    }
    try {
      nutrientData = sweetener_cleaner.clean_and_standardize_nutrients(nutrientData);
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
    res.json({
      msg: 'Nutrients image uploaded successfully',
      analyzeResult: nutrientData,
      coupang: nutrient_image.includes('placeholder') ? { msg: 'No product image found' } : nutrient_image,
      health_score: prediction.predicted_value || 'NaN',
    });

    await userService.insertEatingHistory(user_id, {
      ...nutrientData,
      product_image,
      nutrient_image,
      health_score: prediction.predicted_value ?? -1,
      eating_percent: eating_percent ?? 1.0
    });

    try {
      await rankingUpdater.updateDailyRanking();
      await rankingUpdater.updateWeeklyRanking();
      await rankingUpdater.updateMonthlyRanking();
    } catch (error) {
      console.error(error);
    }


  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ msg: 'Failed to upload nutrients image'});
  }
};


// Get detailed user info
exports.getDetailedProfile = async (req, res) => {
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

// Get eating history for a specific date
exports.getEatingHistoryByDate = async (req, res) => {
  const userId = req.user.id;
  const { date } = req.body;

  if (!date) return res.status(400).json({ msg: 'Date is required' });

  try {
    const eatingHistory = await userService.getEatingHistoryByIdAndDate(userId, date);
    if (!eatingHistory || eatingHistory.length === 0) {
      return res.json([]);
    }
    res.json(eatingHistory);
  } catch (error) {
    console.error('Error fetching eating history:', error);
    return res.status(500).json({ msg: 'Error fetching eating history' });
  }
};


// Get recent eating history
exports.getRecentEatingHistory = async (req, res) => {
  const userId = req.user.id;
  const limit = req.query.limit || 3; // CHANGED: Limit is now from query params for GET requests

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

exports.getEatingHistoryById = async (req, res) => {
  const userId = req.user.id;
  const foodId = req.params.id;

  try {
    const eatingHistory = await userService.getEatingHistoryByFoodId(userId, foodId);
    if (!eatingHistory) {
      return res.status(404).json({ msg: 'No recent eating history found' });
    }
    return res.json(eatingHistory);
  } catch (error) {
    console.error('Error fetching eating history by food id:', error);
    return res.status(500).json({ msg: 'Error fetching eating history '});
  }
}

// Edit a specific eating history record
exports.editEatingHistory = async (req, res) => { // CHANGED: Renamed function to camelCase
  const userId = req.user.id;
  const foodId = req.params.id; // Get ID from URL parameter
  const dataToUpdate = req.body; // Update data is the request body

  try {
    const results = await userService.editEatingHistory(userId, foodId, dataToUpdate);
    if (results.affectedRows === 0) {
      return res.status(404).json({ msg: "Record not found or user not authorized to edit"});
    }
    return res.json({ msg: "Successfully updated eating history"});
  } catch (error) {
    console.error("Error updating eating history:", error);
    return res.status(500).json({ msg: "An error occurred on the server." });
  }
}

// Get which days in a month have records
exports.getDaysWithRecords = async (req, res) => {
  const userId = req.user.id;
  const yearMonth = req.query.month; // CHANGED: Month is now from query params for GET requests

  if (!yearMonth) {
    return res.status(400).json({ msg: 'Month parameter (YYYY-MM) is required.' });
  }

  try {
    const response = await userService.checkEatingHistoryExists(userId, yearMonth);
    // The service returns { days_with_records: [...] }, we just need to forward that.
    return res.json(response); // CHANGED: Simplified response to match API doc { "days_with_records": [...] }
  } catch (error) {
    console.error("Error fetching daysWithRecords:", error);
    return res.status(500).json({ msg: 'Error fetching daysWithRecords'});
  }
}


exports.deleteAccount = async (req, res) => {
  const userId = req.user.id;

  try {
    await userService.deleteUser(userId);
    res.json({ msg: 'Account deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user account:', error);
    return res.status(500).json({ msg: 'Error deleting user account' });
  }
};

exports.updateUserInfo = async (req, res) => {
  const user_id = req.user.id;
  const { user_name, age, height, weight, sex, preg, dis } = req.body;

  if (!user_name || !age || !height || !weight || sex === undefined || preg === undefined) {
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
