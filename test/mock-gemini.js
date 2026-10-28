// 테스트 전용: Gemini API 대신 고정 응답을 돌려준다 (외부 API 키·네트워크 없이 전체 흐름 확인용)
const Module = require('module');
const path = require('path');
const orig = Module._load;
const mock1 = { analyzeNutrients: async () => ({
  food_name: '테스트 프로틴바', calories: 200, protein: 20, fat: 8, carbohydrate: 22, sugar: 5,
  sodium: 150, cholesterol: 10, saturated_fat: 3, trans_fat: 0, food_weight: 60,
  ingredients: '수크랄로스, 에리스리톨', rating: 4, review_text: 'a---SECTION_BREAK---b---SECTION_BREAK---c', product_id: '0' }) };
const mock2 = { analyzeNutrients2: async (d) => ({ ...d, review_text: 'mock review' }) };
Module._load = function (req, parent, isMain) {
  if (parent && /utils[\\/]gemini2?$|gemini2?\.js$/.test(req) && req.includes('gemini')) {
    return req.includes('gemini2') ? mock2 : mock1;
  }
  return orig.apply(this, arguments);
};
