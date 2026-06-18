from typing import List
from backend.app.schemas.schemas import RecommendationItem

def generate_recommendations(
    co2_transport: float,
    co2_electricity: float,
    co2_food: float,
    co2_shopping: float,
    food_preference: str,
    transport_mode: str,
    shopping_freq: str
) -> List[RecommendationItem]:
    recommendations = []

    # 1. Transportation Recommendations
    if co2_transport > 50:
        if transport_mode in ["car_petrol", "car_diesel"]:
            recommendations.append(
                RecommendationItem(
                    category="Transportation",
                    text="Switch to public transport or carpool 2 days a week instead of driving alone.",
                    carbon_saving=round(co2_transport * 0.25, 1),
                    cost_saving=35.0,
                    difficulty="Medium"
                )
            )
            recommendations.append(
                RecommendationItem(
                    category="Transportation",
                    text="Consider upgrading to an electric vehicle (EV) for your daily commutes.",
                    carbon_saving=round(co2_transport * 0.75, 1),
                    cost_saving=90.0,
                    difficulty="Hard"
                )
            )
        elif transport_mode == "car_ev" and co2_transport > 30:
            recommendations.append(
                RecommendationItem(
                    category="Transportation",
                    text="Use a bicycle or walk for short-distance trips under 3 km.",
                    carbon_saving=round(co2_transport * 0.15, 1),
                    cost_saving=10.0,
                    difficulty="Easy"
                )
            )
        elif transport_mode == "public_transport":
            recommendations.append(
                RecommendationItem(
                    category="Transportation",
                    text="Integrate biking or walking into the first/last mile of your transit commute.",
                    carbon_saving=round(co2_transport * 0.1, 1),
                    cost_saving=5.0,
                    difficulty="Easy"
                )
            )
    else:
        recommendations.append(
            RecommendationItem(
                category="Transportation",
                text="Maintain your low-impact transport habits! Walk or bike whenever possible.",
                carbon_saving=5.0,
                cost_saving=0.0,
                difficulty="Easy"
            )
        )

    # 2. Electricity Recommendations
    if co2_electricity > 40:
        recommendations.append(
            RecommendationItem(
                category="Electricity",
                text="Replace incandescent bulbs with energy-efficient LEDs and use smart power strips to eliminate vampire power.",
                carbon_saving=round(co2_electricity * 0.15, 1),
                cost_saving=12.0,
                difficulty="Easy"
            )
        )
        recommendations.append(
            RecommendationItem(
                category="Electricity",
                text="Optimize heating/cooling by setting the thermostat 2°C higher in summer and 2°C lower in winter.",
                carbon_saving=round(co2_electricity * 0.12, 1),
                cost_saving=15.0,
                difficulty="Easy"
            )
        )
        recommendations.append(
            RecommendationItem(
                category="Electricity",
                text="Transition to clean energy by installing solar panels or enrolling in a green energy utility program.",
                carbon_saving=round(co2_electricity * 0.85, 1),
                cost_saving=50.0,
                difficulty="Hard"
            )
        )
    else:
        recommendations.append(
            RecommendationItem(
                category="Electricity",
                text="Unplug electronics when not in use to shave off the remaining standby power emissions.",
                carbon_saving=3.0,
                cost_saving=4.0,
                difficulty="Easy"
            )
        )

    # 3. Food Recommendations
    if food_preference in ["meat_heavy", "meat_medium"]:
        vegetarian_saving = 80.0 if food_preference == "meat_heavy" else 40.0
        vegan_saving = 140.0 if food_preference == "meat_heavy" else 90.0
        recommendations.append(
            RecommendationItem(
                category="Food",
                text="Switch to vegetarian meals 3 days a week. Focus on local, seasonal produce.",
                carbon_saving=vegetarian_saving,
                cost_saving=25.0,
                difficulty="Easy"
            )
        )
        recommendations.append(
            RecommendationItem(
                category="Food",
                text="Adopt a plant-based (vegan) diet to maximize environmental benefits.",
                carbon_saving=vegan_saving,
                cost_saving=40.0,
                difficulty="Medium"
            )
        )
    elif food_preference == "vegetarian":
        recommendations.append(
            RecommendationItem(
                category="Food",
                text="Replace dairy products (cheese, milk) with plant-based alternatives like oat milk or cashew cheese.",
                carbon_saving=30.0,
                cost_saving=10.0,
                difficulty="Easy"
            )
        )
    else:
        recommendations.append(
            RecommendationItem(
                category="Food",
                text="Amazing job with a plant-based diet! Focus on reducing food waste by meal planning.",
                carbon_saving=10.0,
                cost_saving=15.0,
                difficulty="Easy"
            )
        )

    # 4. Shopping Recommendations
    if shopping_freq == "high":
        recommendations.append(
            RecommendationItem(
                category="Shopping",
                text="Try a 'low-buy' month: restrict purchases to essential food and medicine only.",
                carbon_saving=50.0,
                cost_saving=120.0,
                difficulty="Medium"
            )
        )
        recommendations.append(
            RecommendationItem(
                category="Shopping",
                text="Source secondhand clothing or rent apparel for special occasions rather than buying brand new.",
                carbon_saving=35.0,
                cost_saving=60.0,
                difficulty="Easy"
            )
        )
    elif shopping_freq == "medium":
        recommendations.append(
            RecommendationItem(
                category="Shopping",
                text="Adopt the '30-day rule': wait 30 days before buying non-essential items to reduce impulse purchases.",
                carbon_saving=20.0,
                cost_saving=45.0,
                difficulty="Easy"
            )
        )
    else:
        recommendations.append(
            RecommendationItem(
                category="Shopping",
                text="Support ethical and carbon-neutral brands when you do need to make essential purchases.",
                carbon_saving=5.0,
                cost_saving=0.0,
                difficulty="Easy"
            )
        )

    # Sort recommendations by carbon_saving desc
    recommendations.sort(key=lambda x: x.carbon_saving, reverse=True)
    return recommendations
