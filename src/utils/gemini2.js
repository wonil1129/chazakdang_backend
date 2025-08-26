const fs = require('fs');
const { GoogleGenAI, Type } = require('@google/genai');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const nutrientSchema = {
  type: Type.OBJECT,
  properties: {
    rating: { type: Type.INTEGER, description: "건강에 대한 평점, 1에서 5까지의 정수, 기본값 1" },
    review_sweetener: { type: "string", description: "대체당 및 인공 감미료에 대한 분석" },
    review_nutrition: { type: "string", description: "주요 영양성분에 대한 분석" },
    review_health: { type: "string", description: "사용자의 개인 건강 정보(질병, 임신 여부 등)에 맞춘 맞춤 분석" },
  },
  required: [
    'rating', 'review_sweetener', 'review_nutrition', 'review_health'
  ]
};

exports.analyzeNutrients2 = async (nutrientData, userInfo) => {

  const prompt = `
이 식품 이미지의 영양 정보와 사용자 건강 정보를 참고하여 분석 결과를 제공하세요.

식품 정보:
- 제품명: ${nutrientData.food_name}
- 칼로리: ${nutrientData.calories}
- 단백질: ${nutrientData.protein}
- 지방: ${nutrientData.fat}
- 탄수화물: ${nutrientData.carbohydrate}
- 당: ${nutrientData.sugar}
- 소듐: ${nutrientData.sodium}
- 콜레스테롤: ${nutrientData.cholesterol}
- 포화지방: ${nutrientData.saturated_fat}
- 트랜스지방: ${nutrientData.trans_fat}
- 중량: ${nutrientData.food_weight}
- 대체당 목록: ${nutrientData.nutrient_list}

사용자 정보:
- 이름: ${userInfo.user_name}
- 나이: ${userInfo.age}
- 키: ${userInfo.height}cm
- 몸무게: ${userInfo.weight}kg
- 성별: ${userInfo.sex === 1 ? '남성' : '여성'}
- 임신 여부: ${userInfo.preg === 1 ? '임신 중' : '임신 아님'}
- 질병 정보: ${userInfo.dis ?? "질병 없음"}

review_sweetener: 대체당 분석
review_nutrition: 영양성분 분석
review_health: 사용자의 건강 정보에 맞춘 분석
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: nutrientSchema
    },
  });

  const responseText = response.text;

  let parsedResult = JSON.parse(responseText);

  const review_text = [
      parsedResult.review_sweetener,
      parsedResult.review_nutrition,
      parsedResult.review_health
    ].join('---SECTION_BREAK---');

  console.log("2nd output: ", {...nutrientData, review_text});

  return {
    ...nutrientData,
    review_text: review_text
  };
};
