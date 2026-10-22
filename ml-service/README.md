# OKfit Food Recognition ML Microservice

This microservice provides deep-learning based food recognition and automatic nutritional information lookup using PyTorch (MobileNetV2) and Flask.

## Architecture

- **`requirements.txt`**: Python dependencies (`torch`, `torchvision`, `flask`, `flask-cors`, `Pillow`, `gunicorn`).
- **`food_classes.py`**: Mapping of ImageNet-1K food indices to clean human-readable food display names.
- **`nutrition_data.py`**: Nutritional database containing USDA standard data for ~180+ foods with multi-tiered fuzzy lookup (exact match &rarr; substring match &rarr; token overlap match).
- **`model.py`**: `FoodClassifier` class encapsulating MobileNetV2 pre-trained on ImageNet, preprocessing pipeline, and food-filtering inference.
- **`app.py`**: Flask REST API providing CORS-enabled endpoints with file size validation (max 10MB) and nutrition enrichment.

## API Endpoints

### 1. `GET /health`
Returns microservice and model status.
```json
{
  "device": "cpu",
  "model": "MobileNetV2-ImageNet",
  "status": "ok",
  "supported_food_classes": 55
}
```

### 2. `GET /foods`
Returns all supported ImageNet food classes.

### 3. `GET /nutrition/<food_name>`
Looks up nutritional info directly for any given food name.
```json
{
  "query": "pizza",
  "nutrition": {
    "calories": 285,
    "protein": 12.0,
    "carbs": 36.0,
    "fat": 10.4,
    "fiber": 2.5,
    "sugar": 3.8,
    "serving_size": "1 slice (107g)",
    "matched_name": "pizza"
  },
  "success": true
}
```

### 4. `POST /predict`
Upload an image (`multipart/form-data` with form field name `image`) to detect food items and obtain macronutrient breakdown.

**Supported Formats:** JPEG, PNG, WebP, BMP (max 10MB).

**Optional Parameters:**
- `top_k` (integer, default 5): Maximum number of food predictions.
- `min_confidence` (float, default 0.05): Minimum probability threshold.

**Response Example:**
```json
{
  "success": true,
  "foods": [
    {
      "class_id": 963,
      "name": "Pizza",
      "confidence": 92.45,
      "nutrition": {
        "calories": 285,
        "protein": 12.0,
        "carbs": 36.0,
        "fat": 10.4,
        "fiber": 2.5,
        "sugar": 3.8,
        "serving_size": "1 slice (107g)",
        "matched_name": "pizza"
      }
    }
  ],
  "message": null
}
```

## Running the Service

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Start development server
```bash
python app.py
```
Default port is `5001` (can be overridden via the `ML_PORT` environment variable).

### 3. Production Deployment (Gunicorn)
```bash
gunicorn -w 2 -b 0.0.0.0:5001 app:app
```
