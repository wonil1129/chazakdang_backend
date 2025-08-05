const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const GoogleGenAI = require('@google/genai').GoogleGenAI;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});

exports.analyzeNutrients = async (imagePath, prompt) => {
    console.log('Analyzing nutrients for image:', imagePath);

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


    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: 'object',
                properties: {
                    nutritionInfo: {
                        type: 'string',
                        description: 'Nutrition information extracted from the image',
                    },
                },
            },
        }
    });
    const text = await response.text;
    return text;

}