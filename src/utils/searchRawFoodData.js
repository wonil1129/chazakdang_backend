const axios = require('axios');
require('dotenv').config();
const FOODSAFETY_API_KEY = process.env.FOODSAFETY_API_KEY;

exports.getRawFoodDataFromProductID = async (nutrientData) => {
    const product_id = nutrientData.product_id;
    const url = `http://openapi.foodsafetykorea.go.kr/api/${FOODSAFETY_API_KEY}/C002/json/1/5/PRDLST_REPORT_NO=${product_id}`;

    try {
        const response = await axios.get(url);
        const data = response.data.C002.row[0]
        console.log(response.data.C002.row[0]);
        return {
            ...nutrientData,
            food_name: data.PRDLST_NM || nutrientData.food_name,
            nutrient_list: nutrientData.nutrient_list+", "+data.RAWMTRL_NM || nutrientData.nutrient_list,
        }
    } catch (error) {
        console.error("Error fetching data from 식품안전나라:", error);
        return nutrientData;
    }
    
};