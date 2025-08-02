const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.analyzeNutrients = async (imagePath, prompt) => {
    console.log('Analyzing nutrients for image:', imagePath);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const base64ImageFile = fs.readFileSync(imagePath, { encoding: 'base64' });

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

    const result = await model.generateContent(contents);
    const response = await result.response;
    const text = await response.text();
    return text;

}