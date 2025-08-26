const fs = require('fs');
const { GoogleGenAI, Type } = require('@google/genai');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const nutrientSchema = {
  type: Type.OBJECT,
  properties: {
    food_name: { type: Type.STRING, description: "제품명" },
    calories: { type: Type.NUMBER, description: "총 열량, kcal 단위" },
    protein: { type: Type.NUMBER, description: "단백질, g 단위" },
    fat: { type: Type.NUMBER, description: "지방, g 단위" },
    carbohydrate: { type: Type.NUMBER, description: "탄수화물, g 단위" },
    sugar: { type: Type.NUMBER, description: "당류, g 단위" },
    sodium: { type: Type.NUMBER, description: "나트륨, mg 단위" },
    cholesterol: { type: Type.NUMBER, description: "콜레스테롤, mg 단위" },
    saturated_fat: { type: Type.NUMBER, description: "포화지방, g 단위" },
    trans_fat: { type: Type.NUMBER, description: "트랜스지방, g 단위" },
    food_weight: { type: Type.NUMBER, description: "표기된 총 중량 (g 또는 ml 단위의 숫자 값)" },
    ingredients: { type: Type.STRING, description: "원재료 목록에서 찾은 대체당, 인공 감미료. 쉼표로 구분된 문자열. 예: '아스파탐, 수크랄로스'. 없으면 ''." },
    rating: { type: Type.INTEGER, description: "건강에 대한 평점, 1에서 5까지의 정수" },
    review_sweetener: { type: "string", description: "대체당 및 인공 감미료에 대한 분석" },
    review_nutrition: { type: "string", description: "주요 영양성분에 대한 분석" },
    review_health: { type: "string", description: "사용자의 개인 건강 정보(질병, 임신 여부 등)에 맞춘 맞춤 분석" },
    product_id: { type: Type.STRING, description: "품목보고번호 ('-' 제외 숫자만)" },
  },
  required: [
    'food_name', 'calories', 'protein', 'fat', 'carbohydrate', 'sugar',
    'sodium', 'cholesterol', 'saturated_fat', 'trans_fat', 'food_weight',
    'ingredients', 'rating', 'review_sweetener', 'review_nutrition', 'review_health', 'product_id'
  ]
};

exports.analyzeNutrients = async (imagePath, userInfo) => {
  const base64ImageFile = fs.readFileSync(imagePath, { encoding: 'base64' });

  const prompt = `
이 식품 이미지의 영양 정보를 추출하고, 아래 사용자 건강 정보를 참고하여 분석 결과를 제공하세요.
이미지에서 영양 정보를 정확하게 읽어주세요. 만약 특정 필드 값을 이미지에서 찾을 수 없다면, 스키마에 정의된 기본값(숫자는 -1, 문자열은 "" 또는 "없음")을 사용하세요.
품목보고번호(product_id)는 매우 중요한 정보이니 반드시 찾아주세요.

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
  const contents = [
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64ImageFile,
      },
    },
    {
      text: prompt,
    },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: contents,
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
  
  parsedResult.review_text = review_text;

  delete parsedResult.review_sweetener;
  delete parsedResult.review_nutrition;
  delete parsedResult.review_health;

  console.log("responseText: ", parsedResult);

  return parsedResult;
};
