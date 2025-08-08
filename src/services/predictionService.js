const { spawn } = require('child_process');
const path = require('path');

function runPrediction(inputData) {
    return new Promise((resolve, reject) => {
        const venvPythonPath = path.join(__dirname, '../../.venv/bin/python3');
        const scriptPath = path.join(__dirname, 'predict_health_score.py');
        const pythonProcess = spawn(venvPythonPath, [scriptPath]);

        let predictionResult = '';
        let errResult = '';

        const data = {
            Calories: inputData.calories || 0,
            Protein: inputData.protein || 0,
            Fat: inputData.fat || 0,
            Carbohydrates: inputData.carbohydrate || 0,
            Sugar: inputData.sugar || 0,
            Sodium: inputData.sodium || 0,
            Cholesterol: inputData.cholesterol || 0,
            Saturated_Fat: inputData.saturated_fat || 0,
            Trans_Fat: inputData.trans_fat || 0,
        };

        console.log('Data being sent to Python script:', JSON.stringify(data, null, 2));

        pythonProcess.stdout.on('data', (data) => {
            predictionResult += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errResult += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python script exited with code ${code}: ${errResult}`);
                return reject(new Error(`Prediction failed: ${errResult}`));
            }
            try {
                const finalResult = JSON.parse(predictionResult);
                resolve(finalResult);
            } catch (error) {
                console.error('Error parsing prediction result:', error);
                reject(new Error('Failed to parse prediction result'));
            }
        });

        pythonProcess.on('error', (error) => {
            reject(new Error(`Failed to start Python process: ${error.message}`));
        });

        pythonProcess.stdin.write(JSON.stringify(data));
        pythonProcess.stdin.end();
    });
}

module.exports = {
    runPrediction,
}