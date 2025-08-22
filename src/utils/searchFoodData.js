const db = require('../../config/db');

const recalculate_value = (value, food_weight) => {
    if (typeof value !== 'number' || typeof food_weight !== 'number') return value;
    return (value / 100) * food_weight;
};

exports.getFoodDataFromProductID = async (nutrientData) => {
    const product_id = nutrientData.product_id;
    console.log("PRODUCTID:", product_id);

    const checkTableSql = `
      SELECT COUNT(*) AS count
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
      AND table_name = 'food_data'`;

    return new Promise((resolve, reject) => {
        db.query(checkTableSql, (err, result) => {
            if (err) return reject(err);

            if (result[0].count === 0) {
                // Table does not exist, return original nutrientData
                console.log("food_data table does not exist.");
                return resolve(nutrientData);
            }

            // Table exists, query for the product_id
            const sql = `
              SELECT *
              FROM food_data
              WHERE 품목제조보고번호 = ?`;

            db.query(sql, [product_id], (err, results) => {
                if (err) return reject(err);

                if (results.length === 0) {
                    // No matching row, return original nutrientData
                    return resolve(nutrientData);
                }

                const row = results[0];
                const food_weight = row['식품중량'];
                console.log("DB에서 가져온 row: ", row);

                resolve({
                    ...nutrientData,
                    food_name: row['식품명'] || nutrientData.food_name,
                    calories: recalculate_value(row['에너지_kcal'], food_weight) || nutrientData.calories,
                    protein: recalculate_value(row['단백질_g'], food_weight) || nutrientData.protein,
                    fat: recalculate_value(row['지방_g'], food_weight) || nutrientData.fat,
                    carbohydrate: recalculate_value(row['탄수화물_g'], food_weight) || nutrientData.carbohydrate,
                    sugar: recalculate_value(row['당류_g'], food_weight) || nutrientData.sugar,
                    sodium: recalculate_value(row['나트륨_mg'], food_weight) || nutrientData.sodium,
                    cholesterol: recalculate_value(row['콜레스테롤_mg'], food_weight) || nutrientData.cholesterol,
                    saturated_fat: recalculate_value(row['포화지방산_g'], food_weight) || nutrientData.saturated_fat,
                    trans_fat: recalculate_value(row['트랜스지방산_g'], food_weight) || nutrientData.trans_fat,
                    food_weight: row['식품중량'] || nutrientData.food_weight,
                });
            });
        });
    });
};
