const db = require('../../config/db');
const joi = require('joi');

exports.getUserDetailedInfo = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT u.user_id, u.user_name, u.profile_image, u.registration_date,
                   ui.age, ui.height, ui.weight, ui.sex, ui.preg, ui.dis
            FROM user u
            JOIN user_info ui ON u.user_id = ui.user_id
            WHERE u.user_id = ?
        `;
        db.query(sql, [userId], (err, results) => {
            if (err) return reject(err);
            if (results.length === 0) return reject(new Error('User not found'));
            resolve(results[0]);
        });
    });
};

exports.createUser = (user_id, hashedPw, user_name) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO user (user_id, user_pw, user_name, registration_date) VALUES (?, ?, ?, NOW())';

        db.query(sql, [user_id, hashedPw, user_name], (err, result) => {
            if (err) return reject(err);
            resolve(result)
        });
    });
};

exports.deleteUser = (user_id) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM user WHERE user_id = ?';

        db.query(sql, [user_id], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    })
};

exports.createUserInfo = (user_id, age, height, weight, sex, preg, dis) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO user_info (user_id, age, height, weight, sex, preg, dis) VALUES (?, ?, ?, ?, ?, ?, ?)';
        db.query(sql, [user_id, age, height, weight, sex, preg, dis], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

exports.getUserById = (user_id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM user WHERE user_id = ?';
        db.query(sql, [user_id], (err, results) => {
            if (err) return reject(err);
            resolve(results[0] || null);
        });
    });
};

exports.checkDuplicateId = (user_id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT 1 FROM user WHERE user_id = ? LIMIT 1';
        db.query(sql, [user_id], (err, results) => {
            if (err) return reject(err);
            resolve(results.length > 0);
        });
    });
};

exports.getEatingHistoryByIdAndDate = (user_id, date) => {
    return new Promise((resolve, reject) => {
        const sql = `
          SELECT eating_time, food_name, product_image, health_score, nutrient_list, review_text, calories, protein, fat, carbohydrate, sugar, sodium
          FROM eating_history
          WHERE user_id = ? AND DATE(eating_time) = ?
          ORDER BY eating_time ASC
        `;
        db.query(sql, [user_id, date], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

exports.getEatingHistoryByFoodId = (userId, foodId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT eating_time, food_name, product_image, health_score, nutrient_list, review_text, calories, protein, fat, carbohydrate, sugar, sodium
            FROM eating_history
            WHERE user_id = ? AND id = ?
        `;
        db.query(sql, [userId, foodId], (err, results) => {
            if (err) return reject(err);
            resolve(results[0] || null);
        });
    });
};

exports.getTodaySummary = (user_id) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        ROUND(COALESCE(AVG(health_score), 0), 0)  AS avg_health_score,
        ROUND(COALESCE(SUM(sugar), 0), 1)         AS sugar_g,
        ROUND(COALESCE(SUM(calories), 0), 0)      AS calories_kcal
      FROM eating_history
      WHERE user_id = ? AND DATE(eating_time) = CURDATE()
    `;
    db.query(sql, [user_id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0] || { avg_health_score: 0, sugar_g: 0, calories_kcal: 0 });
    });
  });
};

exports.getRecentEatingHistory = (user_id, limit) => {
    return new Promise((resolve, reject) => {
        const recordLimit = parseInt(limit, 10);

        if (isNaN(recordLimit) || recordLimit <= 0) {
            return reject(new Error('Invalid limit parameter provided'));
        }

        const sql = `
          SELECT id, eating_time, food_name, product_image, health_score, nutrient_list,
                review_text, calories, protein, fat, carbohydrate, sugar, sodium
          FROM eating_history
          WHERE user_id = ?
          ORDER BY eating_time DESC
          LIMIT ?
        `;
        db.query(sql, [user_id, recordLimit], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

exports.editEatingHistory = (userId, foodId, data) => {
    return new Promise((resolve, reject) => {
        if (!data || typeof data !== 'object') {
            return reject(new Error("Invalid update data provided"));
        }

        const allowedColumns = [
            'health_score', 'eating_time', 'food_name', 'calories',
            'protein', 'fat', 'carbohydrate', 'sugar', 'sodium',
            'cholesterol', 'saturated_fat', 'trans_fat', 'food_weight',
            'product_image', 'nutrient_image', 'nutrient_list',
            'rating', 'review_text'
        ];

        const setClauses = [];
        const params = [];

        allowedColumns.forEach(column => {
            if (data[column] !== undefined) {
                setClauses.push(`${column} = ?`);
                params.push(data[column]);
            }
        });

        if (setClauses.length === 0) {
            return resolve({ message: "No valid fields provided to update.", changedRows: 0 });
        }

        params.push(foodId);
        params.push(userId);

        const sql = `
            UPDATE eating_history
            SET ${setClauses.join(', ')}
            WHERE id = ? AND user_id = ?
        `;

        db.query(sql, params, (error, results) => {
            if (error) {
                console.error("Error updating eating history:", error);
                return reject(error);
            }
            resolve(results);
        });
    });
};

exports.checkEatingHistoryExists = (userId, yearMonth) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT DISTINCT DAY(eating_time) as day
            FROM eating_history
            WHERE user_id = ? AND eating_time LIKE ?
            ORDER BY day ASC
        `;
        const params = [userId, `${yearMonth}-%`];

        db.query(sql, params, (error, results) => {
            if (error) {
                console.error("Error fetching eating history status:", error);
                return reject(error);
            }
            const daysWithRecords = results.map(row => row.day);
            resolve({ days_with_records: daysWithRecords });
        });
    });
};

exports.updateUserName = (user_id, user_name) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE user SET user_name = ? WHERE user_id = ?';
        db.query(sql, [user_name, user_id], (err, result) => {
            if (err) return reject(err);
            resolve(result.affectedRows > 0);
        });
    });
};

exports.updateUserInfo = (user_id, age, height, weight, sex, preg, dis ) => {
    return new Promise((resolve, reject) => {
        const schema = joi.object({
            user_id: joi.any().required(),
            age: joi.number().integer().min(0).max(9999).required(),
            height: joi.number().min(0).max(9999).required(),
            weight: joi.number().min(0).max(9999).required(),
            sex: joi.required(),
            preg: joi.required(),
            dis: joi.string().allow(null, ''),
        });

        const { error } = schema.validate({
            user_id,
            age,
            height,
            weight,
            sex,
            preg,
            dis,
        });

        if (error) {
            return reject(new Error(`Validation error: ${error.message}`));
        }

        const sql = `
          UPDATE user_info
          SET age = ?, height = ?, weight = ?, sex = ?, preg = ?, dis = ?
          WHERE user_id = ?
          `;
        db.query(sql, [age, height, weight, sex, preg, dis, user_id], (err, result) => {
          if (err) return reject(err);
          if (result.affectedRows === 0) return reject(new Error('User info not found'));
          resolve(result.affectedRows > 0);
        });
    });
};

exports.updateProfileImage = (user_id, profile_image) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE user SET profile_image = ? WHERE user_id = ?';
        db.query(sql, [profile_image, user_id], (err, result) => {
            if (err) return reject(err);
            resolve(result.affectedRows > 0);
        });
    });
};

exports.insertEatingHistory = (user_id, data) => {
    const sql = `
    INSERT INTO eating_history (
      user_id, health_score, eating_time, food_name, calories, protein, fat,
      carbohydrate, sugar, sodium, cholesterol, saturated_fat,
      trans_fat, food_weight, product_image, nutrient_image,
      nutrient_list, rating, review_text
    ) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
    const values = [
      user_id,
      data.health_score,
      data.food_name,
      data.calories,
      data.protein,
      data.fat,
      data.carbohydrate,
      data.sugar,
      data.sodium,
      data.cholesterol,
      data.saturated_fat,
      data.trans_fat,
      data.food_weight,
      data.product_image,
      data.nutrient_image,
      data.nutrient_list,
      data.rating,
      data.review_text,
    ];
    return new Promise((resolve, reject) => {
        db.query(sql, values, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        })
    })
};
