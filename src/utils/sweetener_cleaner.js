const stringSimilarity = require('string-similarity');
const alternativeSweeteners = [
    '아스파탐', '사카린', '수크랄로스', '아세설팜칼륨', '니오탐', '어드벤탐', '시클라메이트', 
    '스테비오사이드', '레바우디오사이드 A', '레바우디오사이드 M', '루비루사이드', '히소퍼사이드', 
    '타우마틴', '미라큘린', '모넬린', '브라즈제인', '커큘린', '펠타딘', '오슬라딘', 
    '로한과 추출물(모그로사이드)', '모그로사이드 IV', '모그로사이드 V', '네오헤스페리딘 DC', 
    '글리시리진산(감초 추출물)', '알룰로스', '타가토스', '에리스리톨', '소르비톨', '소비톨', 
    '자일리톨', '이소말트', '락티톨', '말티톨', '만니톨', '아라비톨', '제롤리톨', '프시코스', 
    '글리세롤', '메틸글리코사이드', '옥타일설페이트', '수오산', '페릴라르틴', 
    '알파-아스파르틸-펜타펩타이드', '켈콜린', '시네트롤', '오볼로스', '판토스', '카이로이노시톨', 
    '마이오이노시톨', '파라툴로스', '케토스', '디하이드록시아세톤당', '메틸알파-D-글루코피라노사이드', 
    '폴리글리시톨', 'D-말티톨'
];

exports.clean_and_standardize_nutrients = (nutrientData) => {
    if (!nutrientData || typeof nutrientData.nutrient_list !== 'string') {
        console.error("Input does not contain a valid 'nutrient_list' string.");
        return nutrientData;
    }
    const ingredientsArray = nutrientData.nutrient_list
        .split(',')
        .map(ingredient => ingredient.trim())
        .filter(ingredient => ingredient);
    const uniqueIngredients = [...new Set(ingredientsArray)];
    const SIMILARITY_THRESHOLD = 0.6;


    const cleanedListAsArray = uniqueIngredients.reduce((accumulator, ingredient) => {
        const { bestMatch } = stringSimilarity.findBestMatch(ingredient, alternativeSweeteners);
        
        console.log(`- Comparing "${ingredient}": Best match is "${bestMatch.target}" with score ${bestMatch.rating.toFixed(2)}`);

        if (bestMatch.rating >= SIMILARITY_THRESHOLD) {
            if (bestMatch.rating < 1.0) {
                console.log(`  -> Replacing "${ingredient}" with "${bestMatch.target}"`);
                accumulator.push(bestMatch.target);
            } else {
                accumulator.push(ingredient);
            }
        }
        return accumulator;
    }, []);
    const finalUniqueList = [...new Set(cleanedListAsArray)];
    const cleanedListAsString = finalUniqueList.join(', ');

    const keys = ["calories", "protein", "fat", "carbohydrate", "sugar", "sodium", "cholesterol", "saturated_fat", "trans_fat"];

    let analyzable = true;

    keys.forEach(key => {
        if (nutrientData[key] == -1) {
            nutrientData[key] = 0;
            analyzable = false;
        }
    });

    return {
        ...nutrientData,
        nutrient_list: cleanedListAsString,
        analyzable: analyzable
    };
};
