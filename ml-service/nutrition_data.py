"""
Nutritional Database and Lookup Utility
Contains nutritional data per serving for ~180 common foods and ImageNet food classes.
Data compiled from USDA FoodData Central and standard nutritional references.
"""

import re
from typing import Any, Dict, Optional

# Comprehensive nutrition database mapping lowercase food names to nutritional values
NUTRITION_DATABASE: Dict[str, Dict[str, Any]] = {
    # --- ImageNet Food Classes & Variants ---
    "guacamole": {
        "calories": 150, "protein": 2.0, "carbs": 8.0, "fat": 13.0,
        "fiber": 6.0, "sugar": 1.0, "serving_size": "100g (approx 1/2 cup)"
    },
    "consomme": {
        "calories": 30, "protein": 5.0, "carbs": 2.0, "fat": 0.2,
        "fiber": 0.0, "sugar": 1.5, "serving_size": "1 cup (240ml)"
    },
    "hot pot": {
        "calories": 350, "protein": 26.0, "carbs": 18.0, "fat": 20.0,
        "fiber": 3.5, "sugar": 4.0, "serving_size": "1 bowl (400g)"
    },
    "trifle": {
        "calories": 290, "protein": 4.5, "carbs": 45.0, "fat": 11.0,
        "fiber": 1.5, "sugar": 32.0, "serving_size": "1 serving (150g)"
    },
    "ice cream": {
        "calories": 207, "protein": 3.5, "carbs": 24.0, "fat": 11.0,
        "fiber": 0.7, "sugar": 21.0, "serving_size": "1/2 cup (66g)"
    },
    "ice lolly": {
        "calories": 70, "protein": 0.2, "carbs": 18.0, "fat": 0.1,
        "fiber": 0.2, "sugar": 14.0, "serving_size": "1 bar (75g)"
    },
    "popsicle": {
        "calories": 70, "protein": 0.2, "carbs": 18.0, "fat": 0.1,
        "fiber": 0.2, "sugar": 14.0, "serving_size": "1 bar (75g)"
    },
    "french loaf": {
        "calories": 185, "protein": 6.0, "carbs": 36.0, "fat": 1.2,
        "fiber": 1.5, "sugar": 1.8, "serving_size": "1 piece (65g)"
    },
    "baguette": {
        "calories": 185, "protein": 6.0, "carbs": 36.0, "fat": 1.2,
        "fiber": 1.5, "sugar": 1.8, "serving_size": "1 piece (65g)"
    },
    "bagel": {
        "calories": 277, "protein": 11.0, "carbs": 53.0, "fat": 1.5,
        "fiber": 2.3, "sugar": 6.0, "serving_size": "1 medium bagel (105g)"
    },
    "pretzel": {
        "calories": 228, "protein": 5.8, "carbs": 47.0, "fat": 1.4,
        "fiber": 1.8, "sugar": 1.5, "serving_size": "1 large soft pretzel (60g)"
    },
    "cheeseburger": {
        "calories": 535, "protein": 30.0, "carbs": 40.0, "fat": 28.0,
        "fiber": 2.0, "sugar": 7.0, "serving_size": "1 burger (220g)"
    },
    "burger": {
        "calories": 450, "protein": 25.0, "carbs": 39.0, "fat": 22.0,
        "fiber": 2.0, "sugar": 6.0, "serving_size": "1 burger (200g)"
    },
    "hamburger": {
        "calories": 450, "protein": 25.0, "carbs": 39.0, "fat": 22.0,
        "fiber": 2.0, "sugar": 6.0, "serving_size": "1 burger (200g)"
    },
    "hot dog": {
        "calories": 290, "protein": 10.5, "carbs": 24.0, "fat": 16.5,
        "fiber": 1.0, "sugar": 4.0, "serving_size": "1 hot dog with bun (100g)"
    },
    "hotdog": {
        "calories": 290, "protein": 10.5, "carbs": 24.0, "fat": 16.5,
        "fiber": 1.0, "sugar": 4.0, "serving_size": "1 hot dog with bun (100g)"
    },
    "mashed potato": {
        "calories": 214, "protein": 3.5, "carbs": 35.0, "fat": 7.0,
        "fiber": 3.0, "sugar": 2.8, "serving_size": "1 cup (210g)"
    },
    "mashed potatoes": {
        "calories": 214, "protein": 3.5, "carbs": 35.0, "fat": 7.0,
        "fiber": 3.0, "sugar": 2.8, "serving_size": "1 cup (210g)"
    },
    "cabbage": {
        "calories": 22, "protein": 1.1, "carbs": 5.2, "fat": 0.1,
        "fiber": 2.2, "sugar": 2.8, "serving_size": "1 cup chopped (89g)"
    },
    "broccoli": {
        "calories": 55, "protein": 3.7, "carbs": 11.2, "fat": 0.6,
        "fiber": 5.1, "sugar": 2.6, "serving_size": "1 cup cooked (156g)"
    },
    "cauliflower": {
        "calories": 29, "protein": 2.3, "carbs": 5.1, "fat": 0.6,
        "fiber": 2.9, "sugar": 2.4, "serving_size": "1 cup cooked (124g)"
    },
    "zucchini": {
        "calories": 27, "protein": 2.1, "carbs": 4.8, "fat": 0.6,
        "fiber": 1.8, "sugar": 3.2, "serving_size": "1 medium (196g)"
    },
    "spaghetti squash": {
        "calories": 42, "protein": 1.0, "carbs": 10.0, "fat": 0.4,
        "fiber": 2.2, "sugar": 4.0, "serving_size": "1 cup cooked (155g)"
    },
    "acorn squash": {
        "calories": 115, "protein": 2.3, "carbs": 30.0, "fat": 0.3,
        "fiber": 9.0, "sugar": 4.0, "serving_size": "1 cup cubed (205g)"
    },
    "butternut squash": {
        "calories": 82, "protein": 1.8, "carbs": 21.5, "fat": 0.2,
        "fiber": 6.6, "sugar": 4.0, "serving_size": "1 cup cooked (205g)"
    },
    "cucumber": {
        "calories": 16, "protein": 0.7, "carbs": 3.8, "fat": 0.2,
        "fiber": 0.6, "sugar": 1.7, "serving_size": "1/2 large cucumber (150g)"
    },
    "artichoke": {
        "calories": 64, "protein": 3.5, "carbs": 14.3, "fat": 0.4,
        "fiber": 6.8, "sugar": 1.3, "serving_size": "1 medium artichoke (128g)"
    },
    "bell pepper": {
        "calories": 31, "protein": 1.0, "carbs": 6.0, "fat": 0.3,
        "fiber": 2.1, "sugar": 4.2, "serving_size": "1 medium (119g)"
    },
    "green bell pepper": {
        "calories": 24, "protein": 1.0, "carbs": 5.5, "fat": 0.2,
        "fiber": 2.0, "sugar": 2.9, "serving_size": "1 medium (119g)"
    },
    "red bell pepper": {
        "calories": 37, "protein": 1.2, "carbs": 7.2, "fat": 0.4,
        "fiber": 2.5, "sugar": 5.0, "serving_size": "1 medium (119g)"
    },
    "cardoon": {
        "calories": 22, "protein": 0.9, "carbs": 5.0, "fat": 0.1,
        "fiber": 1.9, "sugar": 2.0, "serving_size": "1 cup chopped (100g)"
    },
    "mushroom": {
        "calories": 22, "protein": 3.1, "carbs": 3.3, "fat": 0.3,
        "fiber": 1.0, "sugar": 2.0, "serving_size": "1 cup sliced (100g)"
    },
    "agaric mushroom": {
        "calories": 22, "protein": 3.1, "carbs": 3.3, "fat": 0.3,
        "fiber": 1.0, "sugar": 2.0, "serving_size": "1 cup sliced (100g)"
    },
    "hen of the woods mushroom": {
        "calories": 31, "protein": 2.0, "carbs": 7.0, "fat": 0.3,
        "fiber": 2.7, "sugar": 2.0, "serving_size": "1 cup diced (100g)"
    },
    "bolete mushroom": {
        "calories": 26, "protein": 3.5, "carbs": 3.0, "fat": 0.4,
        "fiber": 2.0, "sugar": 1.5, "serving_size": "1 cup sliced (100g)"
    },
    "apple": {
        "calories": 95, "protein": 0.5, "carbs": 25.0, "fat": 0.3,
        "fiber": 4.4, "sugar": 19.0, "serving_size": "1 medium apple (182g)"
    },
    "granny smith apple": {
        "calories": 97, "protein": 0.8, "carbs": 24.4, "fat": 0.4,
        "fiber": 5.0, "sugar": 18.0, "serving_size": "1 medium apple (182g)"
    },
    "strawberry": {
        "calories": 49, "protein": 1.0, "carbs": 11.7, "fat": 0.5,
        "fiber": 3.0, "sugar": 7.4, "serving_size": "1 cup whole (152g)"
    },
    "strawberries": {
        "calories": 49, "protein": 1.0, "carbs": 11.7, "fat": 0.5,
        "fiber": 3.0, "sugar": 7.4, "serving_size": "1 cup whole (152g)"
    },
    "orange": {
        "calories": 62, "protein": 1.2, "carbs": 15.4, "fat": 0.2,
        "fiber": 3.1, "sugar": 12.2, "serving_size": "1 medium orange (131g)"
    },
    "lemon": {
        "calories": 17, "protein": 0.6, "carbs": 5.4, "fat": 0.2,
        "fiber": 1.6, "sugar": 1.5, "serving_size": "1 medium lemon (58g)"
    },
    "fig": {
        "calories": 37, "protein": 0.4, "carbs": 9.6, "fat": 0.2,
        "fiber": 1.4, "sugar": 8.1, "serving_size": "1 medium fresh fig (50g)"
    },
    "pineapple": {
        "calories": 82, "protein": 0.9, "carbs": 21.6, "fat": 0.2,
        "fiber": 2.3, "sugar": 16.3, "serving_size": "1 cup chunks (165g)"
    },
    "banana": {
        "calories": 105, "protein": 1.3, "carbs": 27.0, "fat": 0.4,
        "fiber": 3.1, "sugar": 14.4, "serving_size": "1 medium banana (118g)"
    },
    "jackfruit": {
        "calories": 157, "protein": 2.8, "carbs": 38.3, "fat": 1.1,
        "fiber": 2.5, "sugar": 31.5, "serving_size": "1 cup sliced (165g)"
    },
    "custard apple": {
        "calories": 136, "protein": 2.5, "carbs": 34.0, "fat": 0.4,
        "fiber": 4.4, "sugar": 25.0, "serving_size": "1 medium fruit (150g)"
    },
    "pomegranate": {
        "calories": 234, "protein": 4.7, "carbs": 52.7, "fat": 3.3,
        "fiber": 11.3, "sugar": 38.6, "serving_size": "1 whole pomegranate (282g)"
    },
    "rose hip": {
        "calories": 162, "protein": 1.6, "carbs": 38.2, "fat": 0.3,
        "fiber": 24.1, "sugar": 2.6, "serving_size": "100g"
    },
    "carbonara": {
        "calories": 485, "protein": 22.0, "carbs": 48.0, "fat": 23.0,
        "fiber": 2.5, "sugar": 2.5, "serving_size": "1 plate (300g)"
    },
    "pasta carbonara": {
        "calories": 485, "protein": 22.0, "carbs": 48.0, "fat": 23.0,
        "fiber": 2.5, "sugar": 2.5, "serving_size": "1 plate (300g)"
    },
    "chocolate sauce": {
        "calories": 109, "protein": 0.8, "carbs": 26.0, "fat": 0.6,
        "fiber": 1.0, "sugar": 23.0, "serving_size": "2 tbsp (38g)"
    },
    "chocolate syrup": {
        "calories": 109, "protein": 0.8, "carbs": 26.0, "fat": 0.6,
        "fiber": 1.0, "sugar": 23.0, "serving_size": "2 tbsp (38g)"
    },
    "dough": {
        "calories": 195, "protein": 6.0, "carbs": 37.0, "fat": 2.0,
        "fiber": 1.5, "sugar": 2.0, "serving_size": "80g"
    },
    "bread dough": {
        "calories": 195, "protein": 6.0, "carbs": 37.0, "fat": 2.0,
        "fiber": 1.5, "sugar": 2.0, "serving_size": "80g"
    },
    "meatloaf": {
        "calories": 280, "protein": 21.0, "carbs": 12.0, "fat": 16.0,
        "fiber": 0.5, "sugar": 4.0, "serving_size": "1 slice (120g)"
    },
    "meat loaf": {
        "calories": 280, "protein": 21.0, "carbs": 12.0, "fat": 16.0,
        "fiber": 0.5, "sugar": 4.0, "serving_size": "1 slice (120g)"
    },
    "pizza": {
        "calories": 285, "protein": 12.0, "carbs": 36.0, "fat": 10.4,
        "fiber": 2.5, "sugar": 3.8, "serving_size": "1 slice (107g)"
    },
    "pepperoni pizza": {
        "calories": 313, "protein": 13.0, "carbs": 35.0, "fat": 13.0,
        "fiber": 2.2, "sugar": 3.5, "serving_size": "1 slice (111g)"
    },
    "pot pie": {
        "calories": 410, "protein": 14.0, "carbs": 41.0, "fat": 22.0,
        "fiber": 3.0, "sugar": 3.0, "serving_size": "1 individual pie (250g)"
    },
    "potpie": {
        "calories": 410, "protein": 14.0, "carbs": 41.0, "fat": 22.0,
        "fiber": 3.0, "sugar": 3.0, "serving_size": "1 individual pie (250g)"
    },
    "burrito": {
        "calories": 434, "protein": 18.0, "carbs": 52.0, "fat": 17.0,
        "fiber": 6.0, "sugar": 3.0, "serving_size": "1 burrito (225g)"
    },
    "red wine": {
        "calories": 125, "protein": 0.1, "carbs": 3.8, "fat": 0.0,
        "fiber": 0.0, "sugar": 0.9, "serving_size": "5 fl oz (147ml)"
    },
    "wine": {
        "calories": 123, "protein": 0.1, "carbs": 3.5, "fat": 0.0,
        "fiber": 0.0, "sugar": 1.0, "serving_size": "5 fl oz (147ml)"
    },
    "white wine": {
        "calories": 121, "protein": 0.1, "carbs": 3.8, "fat": 0.0,
        "fiber": 0.0, "sugar": 1.4, "serving_size": "5 fl oz (147ml)"
    },
    "espresso": {
        "calories": 5, "protein": 0.3, "carbs": 0.7, "fat": 0.1,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "1 shot (30ml)"
    },
    "coffee": {
        "calories": 2, "protein": 0.3, "carbs": 0.0, "fat": 0.1,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "1 cup (240ml)"
    },
    "eggnog": {
        "calories": 223, "protein": 4.6, "carbs": 20.4, "fat": 11.3,
        "fiber": 0.0, "sugar": 20.0, "serving_size": "1/2 cup (127g)"
    },
    "corn": {
        "calories": 86, "protein": 3.2, "carbs": 19.0, "fat": 1.2,
        "fiber": 2.7, "sugar": 3.2, "serving_size": "1 medium ear (102g)"
    },
    "sweet corn": {
        "calories": 86, "protein": 3.2, "carbs": 19.0, "fat": 1.2,
        "fiber": 2.7, "sugar": 3.2, "serving_size": "1 medium ear (102g)"
    },
    "beer": {
        "calories": 153, "protein": 1.6, "carbs": 12.6, "fat": 0.0,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "1 bottle/can (355ml)"
    },
    "lobster": {
        "calories": 129, "protein": 27.5, "carbs": 1.3, "fat": 1.2,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "1 cup cooked meat (145g)"
    },
    "spiny lobster": {
        "calories": 122, "protein": 26.4, "carbs": 0.0, "fat": 1.5,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "100g cooked"
    },
    "dungeness crab": {
        "calories": 110, "protein": 22.0, "carbs": 0.0, "fat": 1.7,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "100g cooked"
    },
    "rock crab": {
        "calories": 105, "protein": 21.0, "carbs": 0.0, "fat": 1.5,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "100g cooked"
    },
    "king crab": {
        "calories": 97, "protein": 19.4, "carbs": 0.0, "fat": 1.5,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "100g cooked"
    },
    "crab": {
        "calories": 97, "protein": 19.4, "carbs": 0.0, "fat": 1.5,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "100g cooked"
    },
    "crayfish": {
        "calories": 82, "protein": 16.7, "carbs": 0.0, "fat": 1.2,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "100g cooked"
    },

    # --- Common Grains, Breads & Starches ---
    "white rice": {
        "calories": 206, "protein": 4.3, "carbs": 44.5, "fat": 0.4,
        "fiber": 0.6, "sugar": 0.1, "serving_size": "1 cup cooked (158g)"
    },
    "rice": {
        "calories": 206, "protein": 4.3, "carbs": 44.5, "fat": 0.4,
        "fiber": 0.6, "sugar": 0.1, "serving_size": "1 cup cooked (158g)"
    },
    "brown rice": {
        "calories": 218, "protein": 4.5, "carbs": 45.8, "fat": 1.6,
        "fiber": 3.5, "sugar": 0.7, "serving_size": "1 cup cooked (195g)"
    },
    "jasmine rice": {
        "calories": 205, "protein": 4.2, "carbs": 45.0, "fat": 0.4,
        "fiber": 0.5, "sugar": 0.1, "serving_size": "1 cup cooked (158g)"
    },
    "basmati rice": {
        "calories": 210, "protein": 5.0, "carbs": 45.6, "fat": 0.5,
        "fiber": 1.0, "sugar": 0.1, "serving_size": "1 cup cooked (163g)"
    },
    "quinoa": {
        "calories": 222, "protein": 8.1, "carbs": 39.4, "fat": 3.6,
        "fiber": 5.2, "sugar": 1.6, "serving_size": "1 cup cooked (185g)"
    },
    "white bread": {
        "calories": 79, "protein": 2.7, "carbs": 15.0, "fat": 1.0,
        "fiber": 0.8, "sugar": 1.5, "serving_size": "1 slice (32g)"
    },
    "bread": {
        "calories": 79, "protein": 2.7, "carbs": 15.0, "fat": 1.0,
        "fiber": 0.8, "sugar": 1.5, "serving_size": "1 slice (32g)"
    },
    "whole wheat bread": {
        "calories": 81, "protein": 4.0, "carbs": 13.8, "fat": 1.1,
        "fiber": 1.9, "sugar": 1.4, "serving_size": "1 slice (32g)"
    },
    "sourdough bread": {
        "calories": 93, "protein": 3.8, "carbs": 18.2, "fat": 0.6,
        "fiber": 0.9, "sugar": 0.5, "serving_size": "1 slice (36g)"
    },
    "rye bread": {
        "calories": 83, "protein": 2.7, "carbs": 15.5, "fat": 1.1,
        "fiber": 1.9, "sugar": 1.0, "serving_size": "1 slice (32g)"
    },
    "pita bread": {
        "calories": 165, "protein": 5.5, "carbs": 33.4, "fat": 0.7,
        "fiber": 1.3, "sugar": 1.5, "serving_size": "1 large pita (60g)"
    },
    "naan": {
        "calories": 262, "protein": 8.7, "carbs": 45.4, "fat": 5.1,
        "fiber": 2.2, "sugar": 3.2, "serving_size": "1 piece (90g)"
    },
    "tortilla": {
        "calories": 140, "protein": 3.7, "carbs": 24.0, "fat": 3.5,
        "fiber": 1.5, "sugar": 0.5, "serving_size": "1 medium flour tortilla (45g)"
    },
    "corn tortilla": {
        "calories": 52, "protein": 1.4, "carbs": 10.7, "fat": 0.7,
        "fiber": 1.5, "sugar": 0.2, "serving_size": "1 tortilla (26g)"
    },
    "oatmeal": {
        "calories": 158, "protein": 6.0, "carbs": 27.0, "fat": 3.2,
        "fiber": 4.0, "sugar": 1.1, "serving_size": "1 cup cooked (234g)"
    },
    "rolled oats": {
        "calories": 150, "protein": 5.0, "carbs": 27.0, "fat": 2.5,
        "fiber": 4.0, "sugar": 1.0, "serving_size": "1/2 cup dry (40g)"
    },
    "pasta": {
        "calories": 220, "protein": 8.1, "carbs": 43.0, "fat": 1.3,
        "fiber": 2.5, "sugar": 0.8, "serving_size": "1 cup cooked (140g)"
    },
    "spaghetti": {
        "calories": 220, "protein": 8.1, "carbs": 43.0, "fat": 1.3,
        "fiber": 2.5, "sugar": 0.8, "serving_size": "1 cup cooked (140g)"
    },
    "macaroni": {
        "calories": 221, "protein": 8.1, "carbs": 43.2, "fat": 1.3,
        "fiber": 2.5, "sugar": 0.8, "serving_size": "1 cup cooked (140g)"
    },
    "couscous": {
        "calories": 176, "protein": 6.0, "carbs": 36.5, "fat": 0.3,
        "fiber": 2.2, "sugar": 0.2, "serving_size": "1 cup cooked (157g)"
    },

    # --- Poultry & Meats ---
    "chicken breast": {
        "calories": 165, "protein": 31.0, "carbs": 0.0, "fat": 3.6,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "100g cooked"
    },
    "chicken": {
        "calories": 165, "protein": 31.0, "carbs": 0.0, "fat": 3.6,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "100g cooked"
    },
    "chicken thigh": {
        "calories": 209, "protein": 26.0, "carbs": 0.0, "fat": 10.9,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "100g cooked"
    },
    "chicken wings": {
        "calories": 290, "protein": 27.0, "carbs": 0.0, "fat": 19.5,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "100g cooked"
    },
    "grilled chicken": {
        "calories": 165, "protein": 31.0, "carbs": 0.0, "fat": 3.6,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "100g"
    },
    "rotisserie chicken": {
        "calories": 190, "protein": 27.0, "carbs": 0.0, "fat": 8.5,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "100g"
    },
    "turkey breast": {
        "calories": 135, "protein": 30.0, "carbs": 0.0, "fat": 0.7,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "100g cooked"
    },
    "ground turkey": {
        "calories": 149, "protein": 20.0, "carbs": 0.0, "fat": 8.0,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "100g cooked"
    },
    "steak": {
        "calories": 271, "protein": 26.0, "carbs": 0.0, "fat": 18.0,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "100g cooked"
    },
    "sirloin steak": {
        "calories": 206, "protein": 30.0, "carbs": 0.0, "fat": 8.8,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "100g cooked"
    },
    "ribeye steak": {
        "calories": 291, "protein": 24.0, "carbs": 0.0, "fat": 22.0,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "100g cooked"
    },
    "ground beef": {
        "calories": 250, "protein": 26.0, "carbs": 0.0, "fat": 17.0,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "100g cooked (85% lean)"
    },
    "beef patty": {
        "calories": 250, "protein": 26.0, "carbs": 0.0, "fat": 17.0,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "1 patty (100g)"
    },
    "pork chop": {
        "calories": 231, "protein": 25.7, "carbs": 0.0, "fat": 14.1,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "100g cooked"
    },
    "pork loin": {
        "calories": 197, "protein": 27.0, "carbs": 0.0, "fat": 9.0,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "100g cooked"
    },
    "bacon": {
        "calories": 43, "protein": 3.0, "carbs": 0.1, "fat": 3.3,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "1 slice cooked (8g)"
    },
    "pork sausage": {
        "calories": 290, "protein": 12.0, "carbs": 1.0, "fat": 26.0,
        "fiber": 0.0, "sugar": 0.5, "serving_size": "1 link (75g)"
    },
    "sausage": {
        "calories": 290, "protein": 12.0, "carbs": 1.0, "fat": 26.0,
        "fiber": 0.0, "sugar": 0.5, "serving_size": "1 link (75g)"
    },
    "ham": {
        "calories": 145, "protein": 21.0, "carbs": 1.5, "fat": 5.5,
        "fiber": 0.0, "sugar": 1.5, "serving_size": "100g sliced"
    },
    "lamb chop": {
        "calories": 282, "protein": 25.0, "carbs": 0.0, "fat": 19.5,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "100g cooked"
    },

    # --- Fish & Seafood ---
    "salmon": {
        "calories": 208, "protein": 20.4, "carbs": 0.0, "fat": 13.4,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "100g cooked"
    },
    "grilled salmon": {
        "calories": 208, "protein": 20.4, "carbs": 0.0, "fat": 13.4,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "1 fillet (150g)"
    },
    "tuna": {
        "calories": 132, "protein": 28.0, "carbs": 0.0, "fat": 1.3,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "100g canned in water"
    },
    "canned tuna": {
        "calories": 132, "protein": 28.0, "carbs": 0.0, "fat": 1.3,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "1 can drained (165g)"
    },
    "cod": {
        "calories": 105, "protein": 22.8, "carbs": 0.0, "fat": 0.9,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "100g cooked"
    },
    "tilapia": {
        "calories": 128, "protein": 26.0, "carbs": 0.0, "fat": 2.7,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "100g cooked"
    },
    "shrimp": {
        "calories": 99, "protein": 24.0, "carbs": 0.2, "fat": 0.3,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "100g cooked"
    },
    "scallops": {
        "calories": 111, "protein": 20.5, "carbs": 5.4, "fat": 0.8,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "100g cooked"
    },
    "calamari": {
        "calories": 175, "protein": 18.0, "carbs": 3.1, "fat": 7.5,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "100g fried"
    },
    "sardines": {
        "calories": 208, "protein": 24.6, "carbs": 0.0, "fat": 11.5,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "100g canned in oil"
    },

    # --- Eggs & Dairy ---
    "egg": {
        "calories": 72, "protein": 6.3, "carbs": 0.4, "fat": 4.8,
        "fiber": 0.0, "sugar": 0.2, "serving_size": "1 large egg (50g)"
    },
    "boiled egg": {
        "calories": 78, "protein": 6.3, "carbs": 0.6, "fat": 5.3,
        "fiber": 0.0, "sugar": 0.6, "serving_size": "1 large hard-boiled (50g)"
    },
    "fried egg": {
        "calories": 90, "protein": 6.3, "carbs": 0.4, "fat": 7.0,
        "fiber": 0.0, "sugar": 0.2, "serving_size": "1 large (46g)"
    },
    "scrambled egg": {
        "calories": 91, "protein": 6.1, "carbs": 1.0, "fat": 6.7,
        "fiber": 0.0, "sugar": 0.8, "serving_size": "1 large egg (61g)"
    },
    "egg white": {
        "calories": 17, "protein": 3.6, "carbs": 0.2, "fat": 0.1,
        "fiber": 0.0, "sugar": 0.2, "serving_size": "1 large egg white (33g)"
    },
    "whole milk": {
        "calories": 149, "protein": 7.7, "carbs": 11.7, "fat": 7.9,
        "fiber": 0.0, "sugar": 12.3, "serving_size": "1 cup (244g)"
    },
    "milk": {
        "calories": 149, "protein": 7.7, "carbs": 11.7, "fat": 7.9,
        "fiber": 0.0, "sugar": 12.3, "serving_size": "1 cup (244g)"
    },
    "skim milk": {
        "calories": 83, "protein": 8.3, "carbs": 12.2, "fat": 0.2,
        "fiber": 0.0, "sugar": 12.5, "serving_size": "1 cup (245g)"
    },
    "almond milk": {
        "calories": 39, "protein": 1.5, "carbs": 1.5, "fat": 2.9,
        "fiber": 0.5, "sugar": 0.0, "serving_size": "1 cup unsweetened (240ml)"
    },
    "soy milk": {
        "calories": 105, "protein": 6.3, "carbs": 12.0, "fat": 3.6,
        "fiber": 0.5, "sugar": 8.9, "serving_size": "1 cup (243g)"
    },
    "oat milk": {
        "calories": 120, "protein": 3.0, "carbs": 16.0, "fat": 5.0,
        "fiber": 2.0, "sugar": 7.0, "serving_size": "1 cup (240ml)"
    },
    "cheddar cheese": {
        "calories": 113, "protein": 7.0, "carbs": 0.4, "fat": 9.3,
        "fiber": 0.0, "sugar": 0.1, "serving_size": "1 slice (28g)"
    },
    "cheese": {
        "calories": 113, "protein": 7.0, "carbs": 0.4, "fat": 9.3,
        "fiber": 0.0, "sugar": 0.1, "serving_size": "1 slice (28g)"
    },
    "mozzarella cheese": {
        "calories": 85, "protein": 6.3, "carbs": 0.7, "fat": 6.3,
        "fiber": 0.0, "sugar": 0.3, "serving_size": "1 oz (28g)"
    },
    "parmesan cheese": {
        "calories": 111, "protein": 10.0, "carbs": 0.9, "fat": 7.3,
        "fiber": 0.0, "sugar": 0.2, "serving_size": "1 oz (28g)"
    },
    "swiss cheese": {
        "calories": 108, "protein": 7.6, "carbs": 1.5, "fat": 7.9,
        "fiber": 0.0, "sugar": 0.4, "serving_size": "1 slice (28g)"
    },
    "feta cheese": {
        "calories": 75, "protein": 4.0, "carbs": 1.2, "fat": 6.0,
        "fiber": 0.0, "sugar": 1.2, "serving_size": "1 oz (28g)"
    },
    "cottage cheese": {
        "calories": 163, "protein": 28.0, "carbs": 6.2, "fat": 2.3,
        "fiber": 0.0, "sugar": 6.0, "serving_size": "1 cup low-fat (226g)"
    },
    "cream cheese": {
        "calories": 99, "protein": 1.7, "carbs": 1.2, "fat": 9.9,
        "fiber": 0.0, "sugar": 1.1, "serving_size": "2 tbsp (29g)"
    },
    "greek yogurt": {
        "calories": 130, "protein": 17.0, "carbs": 6.0, "fat": 4.0,
        "fiber": 0.0, "sugar": 4.0, "serving_size": "3/4 cup plain (170g)"
    },
    "yogurt": {
        "calories": 150, "protein": 12.0, "carbs": 17.0, "fat": 3.8,
        "fiber": 0.0, "sugar": 17.0, "serving_size": "1 cup low-fat (245g)"
    },
    "butter": {
        "calories": 102, "protein": 0.1, "carbs": 0.0, "fat": 11.5,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "1 tbsp (14g)"
    },

    # --- Legumes, Plant Proteins & Nuts ---
    "tofu": {
        "calories": 94, "protein": 10.0, "carbs": 2.3, "fat": 5.3,
        "fiber": 0.4, "sugar": 0.6, "serving_size": "1/2 cup firm (126g)"
    },
    "tempeh": {
        "calories": 195, "protein": 20.3, "carbs": 7.6, "fat": 10.8,
        "fiber": 4.0, "sugar": 0.0, "serving_size": "100g"
    },
    "edamame": {
        "calories": 188, "protein": 18.5, "carbs": 13.8, "fat": 8.1,
        "fiber": 8.1, "sugar": 3.4, "serving_size": "1 cup cooked (155g)"
    },
    "lentils": {
        "calories": 230, "protein": 17.9, "carbs": 39.9, "fat": 0.8,
        "fiber": 15.6, "sugar": 3.6, "serving_size": "1 cup cooked (198g)"
    },
    "black beans": {
        "calories": 227, "protein": 15.2, "carbs": 40.8, "fat": 0.9,
        "fiber": 15.0, "sugar": 0.6, "serving_size": "1 cup cooked (172g)"
    },
    "chickpeas": {
        "calories": 269, "protein": 14.5, "carbs": 45.0, "fat": 4.2,
        "fiber": 12.5, "sugar": 7.9, "serving_size": "1 cup cooked (164g)"
    },
    "kidney beans": {
        "calories": 225, "protein": 15.3, "carbs": 40.4, "fat": 0.9,
        "fiber": 11.3, "sugar": 0.6, "serving_size": "1 cup cooked (177g)"
    },
    "hummus": {
        "calories": 70, "protein": 2.4, "carbs": 4.9, "fat": 5.0,
        "fiber": 1.5, "sugar": 0.3, "serving_size": "2 tbsp (30g)"
    },
    "falafel": {
        "calories": 57, "protein": 2.3, "carbs": 5.4, "fat": 3.0,
        "fiber": 0.8, "sugar": 0.3, "serving_size": "1 patty (17g)"
    },
    "peanut butter": {
        "calories": 188, "protein": 8.0, "carbs": 7.0, "fat": 16.0,
        "fiber": 1.9, "sugar": 3.0, "serving_size": "2 tbsp (32g)"
    },
    "almond butter": {
        "calories": 196, "protein": 6.7, "carbs": 6.0, "fat": 17.8,
        "fiber": 3.3, "sugar": 2.0, "serving_size": "2 tbsp (32g)"
    },
    "almonds": {
        "calories": 164, "protein": 6.0, "carbs": 6.1, "fat": 14.2,
        "fiber": 3.5, "sugar": 1.2, "serving_size": "1 oz (28g / ~23 nuts)"
    },
    "walnuts": {
        "calories": 185, "protein": 4.3, "carbs": 3.9, "fat": 18.5,
        "fiber": 1.9, "sugar": 0.7, "serving_size": "1 oz (28g / 14 halves)"
    },
    "cashews": {
        "calories": 157, "protein": 5.2, "carbs": 8.6, "fat": 12.4,
        "fiber": 0.9, "sugar": 1.7, "serving_size": "1 oz (28g / ~18 nuts)"
    },
    "peanuts": {
        "calories": 161, "protein": 7.3, "carbs": 4.6, "fat": 14.0,
        "fiber": 2.4, "sugar": 1.3, "serving_size": "1 oz (28g)"
    },
    "pistachios": {
        "calories": 159, "protein": 5.7, "carbs": 7.7, "fat": 12.9,
        "fiber": 3.0, "sugar": 2.2, "serving_size": "1 oz (28g / ~49 nuts)"
    },
    "pecans": {
        "calories": 196, "protein": 2.6, "carbs": 3.9, "fat": 20.4,
        "fiber": 2.7, "sugar": 1.1, "serving_size": "1 oz (28g)"
    },
    "chia seeds": {
        "calories": 138, "protein": 4.7, "carbs": 12.0, "fat": 8.7,
        "fiber": 9.8, "sugar": 0.0, "serving_size": "1 oz (28g)"
    },
    "flax seeds": {
        "calories": 150, "protein": 5.2, "carbs": 8.2, "fat": 12.0,
        "fiber": 7.8, "sugar": 0.4, "serving_size": "1 oz (28g)"
    },
    "pumpkin seeds": {
        "calories": 151, "protein": 7.0, "carbs": 4.7, "fat": 13.0,
        "fiber": 1.7, "sugar": 0.4, "serving_size": "1 oz (28g)"
    },
    "sunflower seeds": {
        "calories": 165, "protein": 5.5, "carbs": 6.8, "fat": 14.1,
        "fiber": 3.2, "sugar": 0.8, "serving_size": "1 oz (28g)"
    },

    # --- Vegetables & Greens ---
    "spinach": {
        "calories": 23, "protein": 2.9, "carbs": 3.6, "fat": 0.4,
        "fiber": 2.2, "sugar": 0.4, "serving_size": "100g raw (~3 cups)"
    },
    "kale": {
        "calories": 33, "protein": 2.9, "carbs": 6.0, "fat": 0.6,
        "fiber": 2.6, "sugar": 1.6, "serving_size": "1 cup chopped (67g)"
    },
    "lettuce": {
        "calories": 15, "protein": 1.4, "carbs": 2.9, "fat": 0.2,
        "fiber": 1.3, "sugar": 1.2, "serving_size": "1 cup shredded (72g)"
    },
    "romaine lettuce": {
        "calories": 17, "protein": 1.2, "carbs": 3.3, "fat": 0.3,
        "fiber": 2.1, "sugar": 1.2, "serving_size": "1 cup shredded (47g)"
    },
    "arugula": {
        "calories": 5, "protein": 0.5, "carbs": 0.7, "fat": 0.1,
        "fiber": 0.3, "sugar": 0.4, "serving_size": "1 cup (20g)"
    },
    "tomato": {
        "calories": 22, "protein": 1.1, "carbs": 4.8, "fat": 0.2,
        "fiber": 1.5, "sugar": 3.2, "serving_size": "1 medium tomato (123g)"
    },
    "cherry tomatoes": {
        "calories": 27, "protein": 1.3, "carbs": 5.8, "fat": 0.3,
        "fiber": 1.8, "sugar": 3.9, "serving_size": "1 cup (149g)"
    },
    "carrot": {
        "calories": 25, "protein": 0.6, "carbs": 5.8, "fat": 0.1,
        "fiber": 1.7, "sugar": 2.9, "serving_size": "1 medium carrot (61g)"
    },
    "baby carrots": {
        "calories": 35, "protein": 0.8, "carbs": 8.2, "fat": 0.2,
        "fiber": 2.4, "sugar": 4.8, "serving_size": "1 serving (85g)"
    },
    "potato": {
        "calories": 161, "protein": 4.3, "carbs": 36.6, "fat": 0.2,
        "fiber": 3.8, "sugar": 1.5, "serving_size": "1 medium baked (173g)"
    },
    "baked potato": {
        "calories": 161, "protein": 4.3, "carbs": 36.6, "fat": 0.2,
        "fiber": 3.8, "sugar": 1.5, "serving_size": "1 medium baked (173g)"
    },
    "sweet potato": {
        "calories": 103, "protein": 2.3, "carbs": 23.6, "fat": 0.2,
        "fiber": 3.8, "sugar": 7.4, "serving_size": "1 medium baked (114g)"
    },
    "onion": {
        "calories": 44, "protein": 1.2, "carbs": 10.3, "fat": 0.1,
        "fiber": 1.9, "sugar": 4.7, "serving_size": "1 medium onion (110g)"
    },
    "red onion": {
        "calories": 44, "protein": 1.2, "carbs": 10.3, "fat": 0.1,
        "fiber": 1.9, "sugar": 4.7, "serving_size": "1 medium onion (110g)"
    },
    "garlic": {
        "calories": 4, "protein": 0.2, "carbs": 1.0, "fat": 0.0,
        "fiber": 0.1, "sugar": 0.0, "serving_size": "1 clove (3g)"
    },
    "green beans": {
        "calories": 31, "protein": 1.8, "carbs": 7.0, "fat": 0.2,
        "fiber": 2.7, "sugar": 3.3, "serving_size": "1 cup (100g)"
    },
    "peas": {
        "calories": 134, "protein": 8.6, "carbs": 25.0, "fat": 0.4,
        "fiber": 8.8, "sugar": 9.5, "serving_size": "1 cup cooked (160g)"
    },
    "asparagus": {
        "calories": 27, "protein": 3.0, "carbs": 5.2, "fat": 0.2,
        "fiber": 2.8, "sugar": 2.5, "serving_size": "1 cup cooked (180g)"
    },
    "celery": {
        "calories": 6, "protein": 0.3, "carbs": 1.2, "fat": 0.1,
        "fiber": 0.6, "sugar": 0.5, "serving_size": "1 medium stalk (40g)"
    },
    "brussels sprouts": {
        "calories": 56, "protein": 4.0, "carbs": 11.0, "fat": 0.8,
        "fiber": 4.0, "sugar": 2.7, "serving_size": "1 cup cooked (156g)"
    },
    "eggplant": {
        "calories": 35, "protein": 0.8, "carbs": 8.6, "fat": 0.2,
        "fiber": 2.5, "sugar": 3.2, "serving_size": "1 cup cooked cubed (99g)"
    },
    "beets": {
        "calories": 58, "protein": 2.2, "carbs": 13.0, "fat": 0.2,
        "fiber": 3.8, "sugar": 9.2, "serving_size": "1 cup cooked (170g)"
    },
    "radishes": {
        "calories": 19, "protein": 0.8, "carbs": 4.0, "fat": 0.1,
        "fiber": 1.9, "sugar": 2.2, "serving_size": "1 cup sliced (116g)"
    },

    # --- Fruits & Berries ---
    "blueberries": {
        "calories": 84, "protein": 1.1, "carbs": 21.4, "fat": 0.5,
        "fiber": 3.6, "sugar": 14.7, "serving_size": "1 cup (148g)"
    },
    "raspberries": {
        "calories": 64, "protein": 1.5, "carbs": 14.7, "fat": 0.8,
        "fiber": 8.0, "sugar": 5.4, "serving_size": "1 cup (123g)"
    },
    "blackberries": {
        "calories": 62, "protein": 2.0, "carbs": 13.8, "fat": 0.7,
        "fiber": 7.6, "sugar": 7.0, "serving_size": "1 cup (144g)"
    },
    "mango": {
        "calories": 99, "protein": 1.4, "carbs": 24.7, "fat": 0.6,
        "fiber": 2.6, "sugar": 22.5, "serving_size": "1 cup sliced (165g)"
    },
    "peach": {
        "calories": 59, "protein": 1.4, "carbs": 14.3, "fat": 0.4,
        "fiber": 2.3, "sugar": 12.6, "serving_size": "1 medium peach (150g)"
    },
    "pear": {
        "calories": 101, "protein": 0.6, "carbs": 27.1, "fat": 0.3,
        "fiber": 5.5, "sugar": 17.2, "serving_size": "1 medium pear (178g)"
    },
    "watermelon": {
        "calories": 46, "protein": 0.9, "carbs": 11.5, "fat": 0.2,
        "fiber": 0.6, "sugar": 9.4, "serving_size": "1 cup diced (152g)"
    },
    "cantaloupe": {
        "calories": 53, "protein": 1.3, "carbs": 12.7, "fat": 0.3,
        "fiber": 1.4, "sugar": 12.0, "serving_size": "1 cup diced (160g)"
    },
    "grapes": {
        "calories": 104, "protein": 1.1, "carbs": 27.3, "fat": 0.2,
        "fiber": 1.4, "sugar": 23.4, "serving_size": "1 cup (151g)"
    },
    "kiwi": {
        "calories": 42, "protein": 0.8, "carbs": 10.1, "fat": 0.4,
        "fiber": 2.1, "sugar": 6.2, "serving_size": "1 medium kiwi (69g)"
    },
    "papaya": {
        "calories": 62, "protein": 0.7, "carbs": 15.7, "fat": 0.4,
        "fiber": 2.5, "sugar": 11.3, "serving_size": "1 cup chunks (145g)"
    },
    "grapefruit": {
        "calories": 52, "protein": 0.9, "carbs": 13.1, "fat": 0.2,
        "fiber": 2.0, "sugar": 8.5, "serving_size": "1/2 medium fruit (123g)"
    },
    "cherries": {
        "calories": 87, "protein": 1.4, "carbs": 22.1, "fat": 0.3,
        "fiber": 2.9, "sugar": 17.7, "serving_size": "1 cup with pits (138g)"
    },
    "avocado": {
        "calories": 240, "protein": 3.0, "carbs": 12.8, "fat": 22.0,
        "fiber": 10.0, "sugar": 1.0, "serving_size": "1 medium avocado (150g)"
    },

    # --- Prepared Dishes & Meals ---
    "salad": {
        "calories": 120, "protein": 3.0, "carbs": 8.0, "fat": 9.0,
        "fiber": 2.5, "sugar": 3.0, "serving_size": "1 bowl (150g)"
    },
    "caesar salad": {
        "calories": 220, "protein": 5.0, "carbs": 10.0, "fat": 18.0,
        "fiber": 2.5, "sugar": 3.0, "serving_size": "1 bowl with dressing (150g)"
    },
    "greek salad": {
        "calories": 180, "protein": 4.5, "carbs": 9.0, "fat": 15.0,
        "fiber": 3.0, "sugar": 4.0, "serving_size": "1 bowl (180g)"
    },
    "garden salad": {
        "calories": 45, "protein": 1.5, "carbs": 7.0, "fat": 1.0,
        "fiber": 2.5, "sugar": 3.5, "serving_size": "1 bowl without dressing (150g)"
    },
    "fruit salad": {
        "calories": 125, "protein": 1.5, "carbs": 32.0, "fat": 0.5,
        "fiber": 4.0, "sugar": 24.0, "serving_size": "1 cup (200g)"
    },
    "chicken noodle soup": {
        "calories": 130, "protein": 7.0, "carbs": 15.0, "fat": 4.0,
        "fiber": 1.5, "sugar": 2.0, "serving_size": "1 cup (248g)"
    },
    "tomato soup": {
        "calories": 90, "protein": 2.0, "carbs": 16.0, "fat": 2.5,
        "fiber": 2.0, "sugar": 12.0, "serving_size": "1 cup (245g)"
    },
    "clam chowder": {
        "calories": 201, "protein": 8.0, "carbs": 22.0, "fat": 9.0,
        "fiber": 2.0, "sugar": 3.0, "serving_size": "1 cup (240g)"
    },
    "french fries": {
        "calories": 365, "protein": 4.0, "carbs": 48.0, "fat": 17.0,
        "fiber": 4.0, "sugar": 0.3, "serving_size": "1 medium order (117g)"
    },
    "sweet potato fries": {
        "calories": 340, "protein": 3.0, "carbs": 46.0, "fat": 16.0,
        "fiber": 5.0, "sugar": 11.0, "serving_size": "1 medium order (120g)"
    },
    "onion rings": {
        "calories": 411, "protein": 5.0, "carbs": 44.0, "fat": 24.0,
        "fiber": 3.0, "sugar": 5.0, "serving_size": "1 medium order (135g)"
    },
    "potato chips": {
        "calories": 152, "protein": 2.0, "carbs": 15.0, "fat": 9.8,
        "fiber": 1.2, "sugar": 0.1, "serving_size": "1 oz (28g / ~15 chips)"
    },
    "tortilla chips": {
        "calories": 140, "protein": 2.0, "carbs": 19.0, "fat": 7.0,
        "fiber": 1.5, "sugar": 0.2, "serving_size": "1 oz (28g / ~10 chips)"
    },
    "popcorn": {
        "calories": 122, "protein": 3.1, "carbs": 22.0, "fat": 3.6,
        "fiber": 3.6, "sugar": 0.2, "serving_size": "3 cups air-popped (30g)"
    },
    "nachos": {
        "calories": 346, "protein": 9.0, "carbs": 36.0, "fat": 19.0,
        "fiber": 4.0, "sugar": 2.0, "serving_size": "1 serving (113g)"
    },
    "taco": {
        "calories": 210, "protein": 10.0, "carbs": 18.0, "fat": 11.0,
        "fiber": 2.5, "sugar": 1.5, "serving_size": "1 beef taco (100g)"
    },
    "beef taco": {
        "calories": 210, "protein": 10.0, "carbs": 18.0, "fat": 11.0,
        "fiber": 2.5, "sugar": 1.5, "serving_size": "1 taco (100g)"
    },
    "fish taco": {
        "calories": 230, "protein": 14.0, "carbs": 22.0, "fat": 10.0,
        "fiber": 2.0, "sugar": 2.0, "serving_size": "1 taco (115g)"
    },
    "quesadilla": {
        "calories": 430, "protein": 19.0, "carbs": 38.0, "fat": 23.0,
        "fiber": 2.0, "sugar": 2.0, "serving_size": "1 cheese quesadilla (180g)"
    },
    "sushi": {
        "calories": 300, "protein": 9.0, "carbs": 58.0, "fat": 3.6,
        "fiber": 2.0, "sugar": 6.0, "serving_size": "1 roll / 6 pieces (200g)"
    },
    "california roll": {
        "calories": 255, "protein": 9.0, "carbs": 38.0, "fat": 7.0,
        "fiber": 5.8, "sugar": 6.0, "serving_size": "1 roll / 8 pieces (200g)"
    },
    "ramen": {
        "calories": 380, "protein": 10.0, "carbs": 54.0, "fat": 14.0,
        "fiber": 2.5, "sugar": 2.0, "serving_size": "1 bowl with broth (400g)"
    },
    "fried rice": {
        "calories": 330, "protein": 8.0, "carbs": 50.0, "fat": 11.0,
        "fiber": 2.0, "sugar": 1.5, "serving_size": "1 cup (200g)"
    },
    "chicken fried rice": {
        "calories": 345, "protein": 15.0, "carbs": 45.0, "fat": 12.0,
        "fiber": 2.0, "sugar": 1.5, "serving_size": "1 cup (220g)"
    },
    "curry": {
        "calories": 320, "protein": 14.0, "carbs": 24.0, "fat": 18.0,
        "fiber": 4.0, "sugar": 6.0, "serving_size": "1 cup (250g)"
    },
    "chicken curry": {
        "calories": 340, "protein": 24.0, "carbs": 16.0, "fat": 20.0,
        "fiber": 3.0, "sugar": 4.0, "serving_size": "1 cup (250g)"
    },
    "pad thai": {
        "calories": 450, "protein": 15.0, "carbs": 65.0, "fat": 15.0,
        "fiber": 3.0, "sugar": 12.0, "serving_size": "1 plate (300g)"
    },
    "lasagna": {
        "calories": 380, "protein": 21.0, "carbs": 32.0, "fat": 19.0,
        "fiber": 3.0, "sugar": 5.0, "serving_size": "1 piece (250g)"
    },
    "mac and cheese": {
        "calories": 376, "protein": 13.0, "carbs": 43.0, "fat": 17.0,
        "fiber": 2.0, "sugar": 5.0, "serving_size": "1 cup (200g)"
    },

    # --- Desserts & Baked Goods ---
    "chocolate chip cookie": {
        "calories": 148, "protein": 1.6, "carbs": 20.0, "fat": 7.2,
        "fiber": 0.7, "sugar": 11.0, "serving_size": "1 medium cookie (30g)"
    },
    "cookie": {
        "calories": 148, "protein": 1.6, "carbs": 20.0, "fat": 7.2,
        "fiber": 0.7, "sugar": 11.0, "serving_size": "1 medium cookie (30g)"
    },
    "brownie": {
        "calories": 227, "protein": 3.0, "carbs": 31.0, "fat": 11.0,
        "fiber": 1.5, "sugar": 22.0, "serving_size": "1 square (60g)"
    },
    "chocolate cake": {
        "calories": 352, "protein": 4.0, "carbs": 50.0, "fat": 16.0,
        "fiber": 2.0, "sugar": 35.0, "serving_size": "1 slice (100g)"
    },
    "cake": {
        "calories": 352, "protein": 4.0, "carbs": 50.0, "fat": 16.0,
        "fiber": 2.0, "sugar": 35.0, "serving_size": "1 slice (100g)"
    },
    "donut": {
        "calories": 253, "protein": 3.5, "carbs": 29.0, "fat": 14.0,
        "fiber": 1.0, "sugar": 13.0, "serving_size": "1 medium glazed donut (60g)"
    },
    "croissant": {
        "calories": 231, "protein": 4.7, "carbs": 26.0, "fat": 12.0,
        "fiber": 1.5, "sugar": 6.0, "serving_size": "1 medium (57g)"
    },
    "muffin": {
        "calories": 340, "protein": 5.0, "carbs": 52.0, "fat": 13.0,
        "fiber": 2.0, "sugar": 28.0, "serving_size": "1 medium muffin (113g)"
    },
    "blueberry muffin": {
        "calories": 340, "protein": 5.0, "carbs": 52.0, "fat": 13.0,
        "fiber": 2.0, "sugar": 28.0, "serving_size": "1 medium muffin (113g)"
    },
    "pancake": {
        "calories": 175, "protein": 4.0, "carbs": 22.0, "fat": 8.0,
        "fiber": 0.8, "sugar": 3.0, "serving_size": "1 pancake 6-inch (77g)"
    },
    "waffle": {
        "calories": 218, "protein": 6.0, "carbs": 25.0, "fat": 11.0,
        "fiber": 1.0, "sugar": 2.0, "serving_size": "1 round waffle 7-inch (75g)"
    },
    "french toast": {
        "calories": 229, "protein": 7.0, "carbs": 27.0, "fat": 10.0,
        "fiber": 1.5, "sugar": 7.0, "serving_size": "1 slice (85g)"
    },
    "cheesecake": {
        "calories": 321, "protein": 5.5, "carbs": 25.5, "fat": 22.5,
        "fiber": 0.6, "sugar": 18.0, "serving_size": "1 slice (100g)"
    },
    "apple pie": {
        "calories": 296, "protein": 2.4, "carbs": 43.0, "fat": 13.8,
        "fiber": 2.0, "sugar": 18.0, "serving_size": "1 slice (125g)"
    },

    # --- Beverages & Condiments ---
    "green tea": {
        "calories": 2, "protein": 0.5, "carbs": 0.0, "fat": 0.0,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "1 cup (240ml)"
    },
    "black tea": {
        "calories": 2, "protein": 0.0, "carbs": 0.7, "fat": 0.0,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "1 cup (240ml)"
    },
    "tea": {
        "calories": 2, "protein": 0.0, "carbs": 0.5, "fat": 0.0,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "1 cup (240ml)"
    },
    "orange juice": {
        "calories": 112, "protein": 1.7, "carbs": 25.8, "fat": 0.5,
        "fiber": 0.5, "sugar": 20.8, "serving_size": "1 cup (248ml)"
    },
    "apple juice": {
        "calories": 114, "protein": 0.2, "carbs": 28.0, "fat": 0.3,
        "fiber": 0.5, "sugar": 24.0, "serving_size": "1 cup (248ml)"
    },
    "soda": {
        "calories": 140, "protein": 0.0, "carbs": 39.0, "fat": 0.0,
        "fiber": 0.0, "sugar": 39.0, "serving_size": "1 can (355ml)"
    },
    "cola": {
        "calories": 140, "protein": 0.0, "carbs": 39.0, "fat": 0.0,
        "fiber": 0.0, "sugar": 39.0, "serving_size": "1 can (355ml)"
    },
    "protein shake": {
        "calories": 170, "protein": 30.0, "carbs": 6.0, "fat": 3.0,
        "fiber": 1.0, "sugar": 2.0, "serving_size": "1 scoop in water (330ml)"
    },
    "smoothie": {
        "calories": 180, "protein": 3.0, "carbs": 42.0, "fat": 1.0,
        "fiber": 4.0, "sugar": 32.0, "serving_size": "1 cup fruit smoothie (250ml)"
    },
    "olive oil": {
        "calories": 119, "protein": 0.0, "carbs": 0.0, "fat": 13.5,
        "fiber": 0.0, "sugar": 0.0, "serving_size": "1 tbsp (13.5g)"
    },
    "mayonnaise": {
        "calories": 94, "protein": 0.1, "carbs": 0.1, "fat": 10.3,
        "fiber": 0.0, "sugar": 0.1, "serving_size": "1 tbsp (14g)"
    },
    "ketchup": {
        "calories": 19, "protein": 0.2, "carbs": 4.5, "fat": 0.0,
        "fiber": 0.1, "sugar": 3.7, "serving_size": "1 tbsp (17g)"
    },
    "mustard": {
        "calories": 9, "protein": 0.6, "carbs": 0.8, "fat": 0.5,
        "fiber": 0.5, "sugar": 0.4, "serving_size": "1 tsp (5g)"
    },
    "soy sauce": {
        "calories": 10, "protein": 1.3, "carbs": 0.8, "fat": 0.1,
        "fiber": 0.1, "sugar": 0.1, "serving_size": "1 tbsp (16g)"
    },
    "honey": {
        "calories": 64, "protein": 0.1, "carbs": 17.3, "fat": 0.0,
        "fiber": 0.0, "sugar": 17.2, "serving_size": "1 tbsp (21g)"
    },
}


def lookup_nutrition(food_name: str) -> Optional[Dict[str, Any]]:
    """
    Look up nutritional information for a given food name.
    
    Matching strategy:
    1. Exact match (case-insensitive, trimmed)
    2. Partial match (query is substring of key or key is substring of query)
    3. Word overlap match (token Jaccard similarity after removing stop words)
    4. Returns None if no matching food item is found.
    """
    if not food_name or not isinstance(food_name, str):
        return None

    query = food_name.strip().lower()
    if not query:
        return None

    # Step 1: Exact match
    if query in NUTRITION_DATABASE:
        result = dict(NUTRITION_DATABASE[query])
        result["matched_name"] = query
        return result

    # Also test stripped punctuation
    clean_query = re.sub(r'[^a-z0-9\s]', ' ', query)
    clean_query_single_space = " ".join(clean_query.split())
    if clean_query_single_space in NUTRITION_DATABASE:
        result = dict(NUTRITION_DATABASE[clean_query_single_space])
        result["matched_name"] = clean_query_single_space
        return result

    # Step 2: Partial match (substring)
    candidates = []
    for key, data in NUTRITION_DATABASE.items():
        if query in key:
            # Query is contained in database key
            score = len(query) / len(key)
            candidates.append((score, key, data))
        elif key in query:
            # Database key is contained in query
            score = len(key) / len(query)
            candidates.append((score, key, data))

    if candidates:
        # Highest score first (closest length match)
        candidates.sort(key=lambda x: x[0], reverse=True)
        result = dict(candidates[0][2])
        result["matched_name"] = candidates[0][1]
        return result

    # Step 3: Word overlap match (token Jaccard similarity)
    stop_words = {"a", "an", "the", "in", "on", "of", "and", "or", "with", "fresh", "style", "sliced", "cooked", "hot"}
    query_tokens = set(clean_query_single_space.split()) - stop_words

    if query_tokens:
        overlap_candidates = []
        for key, data in NUTRITION_DATABASE.items():
            key_clean = re.sub(r'[^a-z0-9\s]', ' ', key)
            key_tokens = set(key_clean.split()) - stop_words
            if not key_tokens:
                continue

            intersection = query_tokens & key_tokens
            if intersection:
                union = query_tokens | key_tokens
                jaccard = len(intersection) / len(union)
                score = jaccard + (len(intersection) * 0.5)
                overlap_candidates.append((score, key, data))

        if overlap_candidates:
            overlap_candidates.sort(key=lambda x: x[0], reverse=True)
            result = dict(overlap_candidates[0][2])
            result["matched_name"] = overlap_candidates[0][1]
            return result

    return None
