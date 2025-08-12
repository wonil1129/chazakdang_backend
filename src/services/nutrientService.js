const gemini = require('../utils/gemini');

async function analyzeNutrients(imagePath, userInfo) {
    let result = await gemini.analyzeNutrients(imagePath, userInfo);

    if (typeof result === 'string') {
        try {
            result = JSON.parse(result);
        } catch (error) {
            throw new Error('Invalid response from Gemini');
        }
    }

    return {
    food_name: result.food_name || '알 수 없음',
    calories: result.calories || 0,
    protein: result.protein || 0,
    fat: result.fat || 0,
    carbohydrate: result.carbohydrate || 0,
    sugar: result.sugar || 0,
    sodium: result.sodium || 0,
    cholesterol: result.cholesterol || 0,
    saturated_fat: result.saturated_fat || 0,
    trans_fat: result.trans_fat || 0,
    food_weight: result.food_weight || '0g',
    nutrient_list: result.ingredients || '',
    rating: result.rating || 1,
    review_text: result.review_text || '리뷰 없음',
    product_id: result.product_id || '0',
  };
}

module.exports = { analyzeNutrients };