"""
ImageNet Food Class Definitions and Mappings
Maps ImageNet class indices to clean, human-readable food display names.
"""

# Mapping of ImageNet class index -> Clean food display name
FOOD_CLASSES = {
    # Seafood / Crustaceans (commonly prepared as food)
    118: "Dungeness Crab",
    119: "Rock Crab",
    120: "King Crab",
    121: "Lobster",
    122: "Spiny Lobster",
    123: "Crayfish",

    # Beverages
    441: "Beer",
    907: "Wine",
    966: "Red Wine",
    967: "Espresso",
    969: "Eggnog",

    # Prepared Foods & Dishes
    924: "Guacamole",
    925: "Consomme",
    926: "Hot Pot",
    927: "Trifle",
    928: "Ice Cream",
    929: "Ice Lolly",
    930: "French Loaf",
    931: "Bagel",
    932: "Pretzel",
    933: "Cheeseburger",
    934: "Hot Dog",
    935: "Mashed Potato",
    959: "Carbonara",
    960: "Chocolate Sauce",
    961: "Dough",
    962: "Meatloaf",
    963: "Pizza",
    964: "Pot Pie",
    965: "Burrito",

    # Vegetables & Fungi
    936: "Cabbage",
    937: "Broccoli",
    938: "Cauliflower",
    939: "Zucchini",
    940: "Spaghetti Squash",
    941: "Acorn Squash",
    942: "Butternut Squash",
    943: "Cucumber",
    944: "Artichoke",
    945: "Bell Pepper",
    946: "Cardoon",
    947: "Mushroom",
    987: "Corn",
    992: "Agaric Mushroom",
    996: "Hen of the Woods Mushroom",
    997: "Bolete Mushroom",

    # Fruits & Berries
    948: "Apple",
    949: "Strawberry",
    950: "Orange",
    951: "Lemon",
    952: "Fig",
    953: "Pineapple",
    954: "Banana",
    955: "Jackfruit",
    956: "Custard Apple",
    957: "Pomegranate",
    989: "Rose Hip",
}

# Fast lookup set of food class indices
FOOD_CLASS_INDICES = set(FOOD_CLASSES.keys())

# High-level category groupings for display and classification
FOOD_CATEGORIES = {
    "fruits": {948, 949, 950, 951, 952, 953, 954, 955, 956, 957, 989},
    "vegetables": {936, 937, 938, 939, 940, 941, 942, 943, 944, 945, 946, 947, 987, 992, 996, 997},
    "prepared_foods": {924, 925, 926, 927, 928, 929, 930, 931, 932, 933, 934, 935, 959, 960, 961, 962, 963, 964, 965},
    "drinks": {441, 907, 966, 967, 969},
    "seafood": {118, 119, 120, 121, 122, 123},
}


def get_food_category(class_id: int) -> str:
    """Return the category string for a given class id, or 'other' if unclassified."""
    for category, ids in FOOD_CATEGORIES.items():
        if class_id in ids:
            return category
    return "other"
