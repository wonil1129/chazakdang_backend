const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

exports.analyzeNutrients = async (imagePath, userInfo) => {
  console.log('Analyzing nutrients for image:', imagePath);

  const base64ImageFile = fs.readFileSync(imagePath, { encoding: 'base64' });

  const prompt = `
이 이미지는 식품 포장지에 있는 영양 정보 라벨입니다. 아래 정보를 추출하고 사용자 건강 정보를 참고해 분석한 결과를 JSON 형식으로 반환하세요. 출력은 반드시 JSON만 포함해야 합니다.
이미지에서 정확한 영양 정보를 추출하고, 확실히 알아볼 수 없는 텍스트는 'NaN'으로 표기하세요.
제조판매원, 

필드:
- food_name (제품명)
- calories (총 열량, kcal 단위)
- protein (단백질, g)
- fat (지방, g)
- carbohydrate (탄수화물, g)
- sugar (당류, g)
- sodium (나트륨, mg)
- cholesterol (콜레스테롤, mg)
- saturated_fat (포화지방, g)
- trans_fat (트랜스지방, g)
- food_weight (표기된 총 중량, 예: "84g")
- ingredients (대체당, 인공 감미료, 쉼표로 구분된 문자열) 대체당 리스트 = [D-말티톨, 소비톨, 에리스리톨, 폴리글리시톨, 수크랄로스, 아세설팜, 아스파탐, 스테비아, 사카린] 이름 뒤에 시럽 또는 액이 붙어도 대체당으로 간주
- rating (건강에 대한 평점, 1~5 정수로)
- review_text (이 식품이 사용자에게 미치는 건강 영향 분석, 반드시 한국어로 서술)

사용자 정보:
- 이름: ${userInfo.user_name}
- 나이: ${userInfo.age}
- 키: ${userInfo.height}cm
- 몸무게: ${userInfo.weight}kg
- 성별: ${userInfo.sex === 1 ? '남성' : '여성'}
- 임신 여부: ${userInfo.preg === 1 ? '임신 중' : '임신 아님'}
- 질병 정보: ${userInfo.dis}

주의: JSON 이외의 문장은 절대 출력하지 마세요.
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
    model: 'gemini-2.5-flash',
    contents: contents,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'object',
        properties: {
          food_name: { type: 'string' },
          calories: { type: 'number' },
          protein: { type: 'number' },
          fat: { type: 'number' },
          carbohydrate: { type: 'number' },
          sugar: { type: 'number' },
          sodium: { type: 'number' },
          cholesterol: { type: 'number' },
          saturated_fat: { type: 'number' },
          trans_fat: { type: 'number' },
          food_weight: { type: 'string' },
          ingredients: { type: 'string' },
          rating: {
            type: 'integer',
            minimum: 1,
            maximum: 5,
            description: '건강 평가 점수 (1~5 정수)',
          },
          review_text: {
            type: 'string',
            description: '사용자 건강 상태 기반 분석 결과 (한국어)',
          },
        },
        required: [
          'food_name', 'calories', 'protein', 'fat', 'carbohydrate', 'sugar',
          'sodium', 'cholesterol', 'saturated_fat', 'trans_fat', 'food_weight',
          'ingredients', 'rating', 'review_text',
        ],
      },
    },
  });


  const result = await response.text;
  return result;
};
