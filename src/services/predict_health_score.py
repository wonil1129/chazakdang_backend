import sys
import json
import numpy as np
import joblib
import os

def main():
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(script_dir, "regression_model.joblib")
        model = joblib.load(model_path)
    except FileNotFoundError:
        error_response = {"error": "Model file not found. Please train the model first."}
        print(json.dumps(error_response), file=sys.stderr)
        sys.exit(1)

    input_data_str = sys.stdin.read()

    print(f"---PYTHON DEBUG START---\nRaw data received from Node.js:\n{input_data_str}\n---PYTHON DEBUG END---", file=sys.stderr)


    try:
        input_data = json.loads(input_data_str)
        
        features = np.array([[
            input_data['Calories'],
            input_data['Protein'],
            input_data['Fat'],
            input_data['Carbohydrates'],
            input_data['Sugar'],
            input_data['Sodium'],
            input_data['Cholesterol'],
            input_data['Saturated_Fat'],
            input_data['Trans_Fat'],
        ]])
        prediction = model.predict(features)
        response = {"predicted_value": float(prediction[0])}
        print(json.dumps(response))
    except (json.JSONDecodeError, KeyError) as e:
        error_response = {"error": "Invalid input data format. Please provide valid JSON with required fields."}
        print(json.dumps(error_response), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
