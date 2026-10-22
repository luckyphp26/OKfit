"""
Food Classifier Model using Pretrained MobileNetV2
Loads MobileNetV2 pretrained on ImageNet and filters predictions to food classes.
"""

import io
from typing import Any, Dict, List
from PIL import Image
import torch
from torchvision import models, transforms
from food_classes import FOOD_CLASSES, FOOD_CLASS_INDICES


class FoodClassifier:
    """Classifies food items using MobileNetV2 pretrained on ImageNet."""

    def __init__(self):
        self.model = None
        self.transform = None
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self._load_model()

    def _load_model(self):
        """Load MobileNetV2 pretrained on ImageNet."""
        try:
            # Modern torchvision (>= 0.13)
            weights = models.MobileNet_V2_Weights.IMAGENET1K_V1
            self.model = models.mobilenet_v2(weights=weights)
        except AttributeError:
            # Legacy torchvision fallback
            self.model = models.mobilenet_v2(pretrained=True)

        self.model.eval()
        self.model.to(self.device)

        # Standard ImageNet preprocessing pipeline
        self.transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            ),
        ])

    def predict(
        self,
        image_bytes: bytes,
        top_k: int = 5,
        min_confidence: float = 0.05
    ) -> List[Dict[str, Any]]:
        """
        Predict food classes from image bytes.

        Args:
            image_bytes: Raw binary image payload.
            top_k: Maximum number of food predictions to return.
            min_confidence: Minimum probability threshold (0.0 to 1.0) to include a class.

        Returns:
            List of dicts: [ { 'name': str, 'confidence': float (0-100), 'class_id': int } ]
            Sorted by confidence descending.
        """
        # Load and preprocess image
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        input_tensor = self.transform(image).unsqueeze(0).to(self.device)

        # Run inference
        with torch.no_grad():
            output = self.model(input_tensor)
            probabilities = torch.nn.functional.softmax(output[0], dim=0)

        # Extract predictions to CPU numpy array
        all_probs = probabilities.cpu().numpy()

        # Filter strictly to known food classes above min_confidence threshold
        food_predictions: List[Dict[str, Any]] = []
        for idx in FOOD_CLASS_INDICES:
            conf = float(all_probs[idx])
            if conf >= min_confidence:
                food_predictions.append({
                    'name': FOOD_CLASSES[idx],
                    'confidence': round(conf * 100, 2),
                    'class_id': idx
                })

        # Sort descending by confidence
        food_predictions.sort(key=lambda x: x['confidence'], reverse=True)

        # Return top_k
        return food_predictions[:top_k]
