"""
Flask Food Recognition Microservice
Provides REST endpoints for food classification using MobileNetV2 and nutrition enrichment.
"""

import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from food_classes import FOOD_CLASSES
from model import FoodClassifier
from nutrition_data import lookup_nutrition

app = Flask(__name__)
CORS(app)

# Load model at application startup
classifier = FoodClassifier()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'bmp'}


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint to verify service and model status."""
    return jsonify({
        'status': 'ok',
        'model': 'MobileNetV2-ImageNet',
        'device': str(classifier.device),
        'supported_food_classes': len(FOOD_CLASSES)
    })


@app.route('/foods', methods=['GET'])
def list_foods():
    """List all supported ImageNet food classes."""
    return jsonify({
        'success': True,
        'count': len(FOOD_CLASSES),
        'foods': sorted(list(set(FOOD_CLASSES.values())))
    })


@app.route('/nutrition/<food_name>', methods=['GET'])
def get_nutrition(food_name):
    """Direct nutrition lookup endpoint for a given food item name."""
    nutrition = lookup_nutrition(food_name)
    if not nutrition:
        return jsonify({
            'success': False,
            'error': f"No nutritional data found for '{food_name}'"
        }), 404
    return jsonify({
        'success': True,
        'query': food_name,
        'nutrition': nutrition
    })


@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict food class from uploaded image and enrich with nutritional data.
    Expects multipart/form-data with an 'image' file field.
    Optional parameters:
      - top_k: maximum number of predictions (default: 5)
      - min_confidence: minimum threshold (default: 0.05)
    """
    try:
        if 'image' not in request.files:
            return jsonify({'success': False, 'error': 'No image provided'}), 400

        file = request.files['image']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400

        # Check file extension
        ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''
        if ext not in ALLOWED_EXTENSIONS:
            return jsonify({
                'success': False,
                'error': f"Unsupported format: '{ext}'. Use JPEG, PNG, WebP, or BMP"
            }), 400

        # Read file bytes and validate size
        image_bytes = file.read()
        if len(image_bytes) > MAX_FILE_SIZE:
            return jsonify({'success': False, 'error': 'File too large (max 10MB)'}), 400

        if len(image_bytes) == 0:
            return jsonify({'success': False, 'error': 'Empty file'}), 400

        # Optional customization parameters
        top_k = 5
        min_conf = 0.05
        try:
            if 'top_k' in request.form:
                top_k = int(request.form['top_k'])
            elif 'top_k' in request.args:
                top_k = int(request.args['top_k'])
        except (ValueError, TypeError):
            top_k = 5

        try:
            if 'min_confidence' in request.form:
                min_conf = float(request.form['min_confidence'])
            elif 'min_confidence' in request.args:
                min_conf = float(request.args['min_confidence'])
        except (ValueError, TypeError):
            min_conf = 0.05

        # Run model prediction
        predictions = classifier.predict(
            image_bytes=image_bytes,
            top_k=top_k,
            min_confidence=min_conf
        )

        if not predictions:
            return jsonify({
                'success': True,
                'foods': [],
                'message': 'No food items detected in this image. Try a clearer photo of food.'
            })

        # Enrich predictions with nutrition data
        for pred in predictions:
            nutrition = lookup_nutrition(pred['name'])
            pred['nutrition'] = nutrition

        return jsonify({
            'success': True,
            'foods': predictions,
            'message': None
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to process image: {str(e)}'
        }), 500


if __name__ == '__main__':
    port = int(os.environ.get('ML_PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)
