/**
 * @file 건강 점수 계산 모듈 (v1)
 * @description 제공된 식품의 원시 영양 데이터(총량 기준)와 옵션을 바탕으로 건강 점수를 계산합니다.
 * 내부적으로 모든 영양 정보를 100g 또는 100ml 기준으로 정규화하여 평가합니다.
 */

// ##################################################################
// #  내부 점수 계산 엔진 (사용자 제공 로직)
// #  (모든 영양 입력값은 100g/100ml 기준으로 정규화되었다고 가정)
// ##################################################################

/**
 * @typedef {Object} NutritionInput
 * @property {number} calories       // kcal per 100g/ml
 * @property {number} protein        // g per 100g/ml
 * @property {number} fat            // g per 100g/ml
 * @property {number} carbs          // g per 100g/ml
 * @property {number} sugars         // g per 100g/ml
 * @property {number} sodium         // mg per 100g/ml
 * @property {number} cholesterol    // mg per 100g/ml
 * @property {number} saturatedFat   // g per 100g/ml
 * @property {number} transFat       // g per 100g/ml
 */

/**
 * @typedef {Object} ScoreOptions
 * @property {boolean} [isBeverage=false]     // true면 음료 규칙(100ml 기준) 적용
 * @property {boolean} [sugarIsFree=true]     // sugars가 '자유당'인지 여부
 * @property {boolean} [hasNSS=false]         // 무·저칼로리 감미료 포함 여부
 * @property {1|2|3|4} [nova]                 // NOVA 가공도 (1=최소 가공, 4=초가공)
 * @property {number} [fiber=0]               // g per 100g/ml
 * @property {boolean} [applyPolicyCaps=true] // 정책 캡(설탕음료≤40, 제로음료≤60) 적용 여부
 */

/**
 * 정규화된 영양 정보를 바탕으로 건강 점수를 계산합니다. (내부용 함수)
 * @param {NutritionInput} nutri 100g/ml 기준 영양 정보
 * @param {ScoreOptions} [opts={}] 점수 계산 옵션
 * @returns {object} 점수 계산 결과
 */
function computeHealthScore(nutri, opts = {}) {
  const {
    isBeverage = false,
    sugarIsFree = true,
    hasNSS = false,
    nova,
    fiber = 0,
    applyPolicyCaps = true,
  } = opts;

  // 안전 처리: 유효한 숫자가 아니면 0으로 처리
  const N = (v) => (isFinite(v) && v > 0 ? Number(v) : 0);

  const sugars = N(nutri.sugars);
  const sat = N(nutri.saturatedFat);
  const na = N(nutri.sodium);

  const breakdown = {
    sugar: 0,
    saturatedFat: 0,
    sodium: 0,
    fiber: 0,
    nss: 0,
    nova: 0,
  };

  // A) 당 (자유당만 페널티)
  if (sugarIsFree) {
    if (isBeverage) {
      if (sugars > 11.25) breakdown.sugar = -60;
      else if (sugars > 2.5) breakdown.sugar = -40;
    } else {
      if (sugars > 22.5) breakdown.sugar = -40;
      else if (sugars > 5) breakdown.sugar = -20;
    }
  }

  // B) 포화지방 (음식/음료 동일 임계 적용)
  if (sat > 5) breakdown.saturatedFat = -30;
  else if (sat > 1.5) breakdown.saturatedFat = -15;

  // C) 나트륨 (소금 0.3/1.5g ↔ 나트륨 120/600mg)
  if (na > 600) breakdown.sodium = -30;
  else if (na > 120) breakdown.sodium = -15;

  // D) 식이섬유 보너스
  if (fiber >= 6) breakdown.fiber = +15;
  else if (fiber >= 3) breakdown.fiber = +8;

  // E) NSS(무·저칼로리 감미료) 페널티
  if (hasNSS) breakdown.nss = -15;

  // F) NOVA 가공도 보정
  if (nova === 1) breakdown.nova = +10;
  else if (nova === 4) breakdown.nova = -10;

  // 합산
  const subtotal = 50 + breakdown.sugar + breakdown.saturatedFat + breakdown.sodium + breakdown.fiber + breakdown.nss + breakdown.nova;

  // 정책 캡
  let capApplied = null;
  let finalScore = subtotal;

  if (applyPolicyCaps && isBeverage) {
    // sugars > 0.1 과 같이 작은 임계값을 두어 부동소수점 오류 방지
    if (sugars > 0.1 && sugarIsFree) {
      finalScore = Math.min(finalScore, 40);
      capApplied = "sugaryBeverageMax40";
    } else if (hasNSS) {
      finalScore = Math.min(finalScore, 60);
      capApplied = "zeroBeverageMax60";
    }
  }

  // 최종 0~100 클램프
  finalScore = Math.max(0, Math.min(100, finalScore));

  return {
    score: Math.round(finalScore),
    subtotal: Math.round(subtotal),
    capApplied,
    breakdown,
    notes: [
      "모든 수치는 100g(음식)/100ml(음료) 기준으로 입력했다고 가정합니다.",
      "당류(sugars)는 자유당일 때만 페널티가 적용됩니다(옵션 sugarIsFree).",
      "v1에서는 포화지방·나트륨·자유당만 감점에 반영됩니다. 나머지 지표는 확장용입니다.",
    ],
  };
}


// ##################################################################
// #  모듈 Export 함수
// #  (원시 데이터 입력을 받아 100g/ml 기준으로 변환 후 계산 엔진 호출)
// ##################################################################

/**
 * @typedef {Object} RawNutritionData
 * @property {number} calories        // 총량에 대한 kcal (g)
 * @property {number} protein         // 총량에 대한 단백질 (g)
 * @property {number} fat             // 총량에 대한 지방 (g)
 * @property {number} carbohydrate    // 총량에 대한 탄수화물 (g)
 * @property {number} sugar           // 총량에 대한 당류 (g)
 * @property {number} sodium          // 총량에 대한 나트륨 (mg)
 * @property {number} cholesterol     // 총량에 대한 콜레스테롤 (mg)
 * @property {number} saturated_fat   // 총량에 대한 포화지방 (g)
 * @property {number} trans_fat       // 총량에 대한 트랜스지방 (g)
 * @property {number} food_weight     // 식품의 총 중량 (g) 또는 총 용량 (ml)
 */

/**
 * 원시 영양 데이터와 옵션을 받아 건강 점수를 계산하는 메인 함수입니다.
 * @param {RawNutritionData} rawData 식품의 총량 기준 영양 정보
 * @param {ScoreOptions} options 점수 계산 옵션
 * @returns {object} 점수 계산 결과
 * @example
 * const colaResult = analyzeFoodItem(
 * { food_weight: 355, sugar: 39, sodium: 53.25 }, // 355ml 콜라 (나트륨 15mg/100ml)
 * { isBeverage: true, sugarIsFree: true }
 * );
 * console.log(colaResult.score); // 40
 */
function analyzeFoodItem(rawData, options = {}) {
  // 입력값 유효성 검사
  if (!rawData || typeof rawData !== 'object') {
    throw new Error("올바른 'rawData' 객체를 입력해주세요.");
  }
  console.log("rawData: ", rawData);
  const foodWeight = parseFloat(rawData.food_weight);
  if (!isFinite(foodWeight) || foodWeight <= 0) {
    throw new Error("'food_weight'는 0보다 큰 숫자여야 합니다.");
  }

  /**
   * 총량 기준 영양성분 값을 100g(또는 100ml) 기준으로 변환하는 헬퍼 함수
   * @param {number | string} value 총량 기준 영양성분 값
   * @returns {number} 100g/ml 기준 값
   */
  const normalizeTo100 = (value) => {
    const numValue = parseFloat(value);
    if (!isFinite(numValue)) return 0;
    return (numValue / foodWeight) * 100;
  };

  // rawData(snake_case)를 computeHealthScore가 요구하는 nutri(camelCase) 형식으로 변환
  const normalizedNutrition = {
    calories: normalizeTo100(rawData.calories),
    protein: normalizeTo100(rawData.protein),
    fat: normalizeTo100(rawData.fat),
    carbs: normalizeTo100(rawData.carbohydrate),
    sugars: normalizeTo100(rawData.sugar),
    sodium: normalizeTo100(rawData.sodium),
    cholesterol: normalizeTo100(rawData.cholesterol),
    saturatedFat: normalizeTo100(rawData.saturated_fat),
    transFat: normalizeTo100(rawData.trans_fat),
  };
  console.log("normalized Nutrition: ", normalizedNutrition);
  
  // 식이섬유는 옵션 객체에 있으므로 별도 처리 (100g당 값으로 직접 받는다고 가정)
  const scoreOptions = { ...options };
  if (rawData.fiber) {
    scoreOptions.fiber = normalizeTo100(rawData.fiber);
  }

  // 정규화된 데이터와 옵션을 사용하여 최종 점수 계산
  return computeHealthScore(normalizedNutrition, scoreOptions);
}

module.exports = { analyzeFoodItem };