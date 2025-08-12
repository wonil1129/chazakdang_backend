const db = require('../../config/db');

const recalculate_value = (value, food_weight) => {
    return (value/100)*food_weight;
}

exports.getFoodDataFromProductID = (nutrientData) => {
    const product_id = nutrientData.product_id;
    console.log("PRODUCTID:", product_id);
    sql = `
    SELECT *
    FROM food_data
    WHERE 품목제조보고번호 = ?`;
    return new Promise((resolve, reject) => {
        db.query(sql, [product_id], (err, results) => {
            if (err) return reject(err);
            if (results.length === 0) {
                return resolve({
                    ...nutrientData,
                });
            }

            const row = results[0];
            console.log("DB에서 가져온 row: ", row);

            resolve({
                ...nutrientData,
                food_name: row['식품명'] || nutrientData.food_name,
                calories: row['에너지_kcal'] || nutrientData.calories,
                protein: row['단백질_g'] || nutrientData.protein,
                fat: row['지방_g'] || nutrientData.fat,
                carbohydrate: row['탄수화물_g'] || nutrientData.carbohydrate,
                sugar: row['당류_g'] || nutrientData.sugar,
                sodium: row['나트륨_mg'] || nutrientData.sodium,
                cholesterol: row['콜레스테롤_mg'] || nutrientData.cholesterol,
                saturated_fat: row['포화지방산_g'] || nutrientData.saturated_fat,
                trans_fat: row['트랜스지방산_g'] || nutrientData.trans_fat,
                food_weight: row['식품중량'] || nutrientData.food_weight,
            });
        });
    });
};