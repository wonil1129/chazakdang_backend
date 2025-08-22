const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// The groundingTool is used for web searches.
// We are specifying Google Search as the tool to be used.
const groundingTool = {
  googleSearch: {},
};

exports.analyzeNutrients = async (imagePath, userInfo) => {
  const base64ImageFile = fs.readFileSync(imagePath, { encoding: 'base64' });

  // Prompt the model to output a JSON string, but without enforcing it with the API.
  // The model will still do its best to adhere to this format.
  const prompt = `
이 식품 이미지를 검색 도구를 사용해 검색하고 아래 정보를 추출하여 사용자 건강 정보를 참고해 분석한 결과를 JSON 형식으로 반환하세요. 출력은 반드시 JSON만 포함해야 합니다.
이미지에서 정확한 영양 정보를 추출하고, 확실히 알아볼 수 없는 텍스트는 default 값으로 표기하세요.

필드:
- food_name (제품명) default: "" (빈 문자열)
- calories (총 열량, kcal 단위) default: -1
- protein (단백질, g) default: -1
- fat (지방, g) default: -1
- carbohydrate (탄수화물, g) default: -1
- sugar (당류, g) default: -1
- sodium (나트륨, mg) default: -1
- cholesterol (콜레스테롤, mg) default: -1
- saturated_fat (포화지방, g) default: -1
- trans_fat (트랜스지방, g) default: -1
- food_weight (표기된 총 중량, 예: "84") default: -1 84g일시 84, 1.5L일시 1500으로, 1500ml일시 1500으로
- ingredients (대체당, 인공 감미료, 쉼표로 구분된 문자열. 원재료 목록이 아닌 대체당 리스트만 출력) 대체당 리스트 = [D-말티톨, 소비톨, 에리스리톨, 폴리글리시톨, 수크랄로스, 아세설팜, 아스파탐, 스테비아, 사카린] 이름 뒤에 시럽 또는 액이 붙어도 대체당으로 간주 default: '없음'
- rating (건강에 대한 평점, 1~5 정수로)
- review_text (이 식품이 사용자에게 미치는 건강 영향 분석, 반드시 한국어로 서술)
- product_id (품목보고번호) 가장 중요한 정보! 예시: 19730443003-1510일시, 197304430031510으로 ('-' 무시하고 숫자만) default: "" (빈 문자열)

사용자 정보:
- 이름: ${userInfo.user_name}
- 나이: ${userInfo.age}
- 키: ${userInfo.height}cm
- 몸무게: ${userInfo.weight}kg
- 성별: ${userInfo.sex === 1 ? '남성' : '여성'}
- 임신 여부: ${userInfo.preg === 1 ? '임신 중' : '임신 아님'}
- 질병 정보: ${userInfo.dis}

주의: JSON 이외의 문장은 절대 출력하지 마세요.
만약 검색한 내용에 비어있는 정보값들이 존재하면 다시 검색해서 정보들을 찾아오세요
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
      tools: [groundingTool],
    },
  });

  const rawText = response.text;

  // ===================================
  // Manual parsing of the JSON from the raw text response
  // ===================================
  console.log("Raw text response from Gemini:", rawText);

  // Use a regular expression to find the JSON string within the response.
  // This is a common method but can be fragile if the model's output format varies.
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);

  if (jsonMatch) {
    try {
      // Parse the matched JSON string
      let parsedResult = JSON.parse(jsonMatch[0]);
      console.log("Successfully parsed JSON:", parsedResult);
      parsedResult.review_text = parsedResult.review_text.replace(/\[[\d,\s]+\]|\[Image\]/g, '');
      return parsedResult;
    } catch (e) {
      console.error("Failed to parse JSON from response:", e);
      // If parsing fails, you can return a structured error or null
      throw new Error("Failed to parse JSON from model output.");
    }
  } else {
    console.error("No JSON found in the model's response.");
    throw new Error("Model did not return a valid JSON structure.");
  }
};
