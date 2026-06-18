# Carbon Footprint Calculator Logic
# Standard emission factors based on EPA/IPCC approximations

EMISSION_FACTORS = {
    "transport": {
        "car_petrol": 0.22,      # kg CO2 per km
        "car_diesel": 0.19,      # kg CO2 per km
        "car_ev": 0.05,          # kg CO2 per km (average grid charging)
        "public_transport": 0.08, # kg CO2 per km
        "bicycle": 0.0,          # kg CO2 per km
        "walk": 0.0              # kg CO2 per km
    },
    "food": {
        "meat_heavy": 250.0,     # kg CO2 per month
        "meat_medium": 180.0,    # kg CO2 per month
        "vegetarian": 100.0,     # kg CO2 per month
        "vegan": 60.0            # kg CO2 per month
    },
    "shopping": {
        "high": 150.0,           # kg CO2 per month
        "medium": 75.0,          # kg CO2 per month
        "low": 25.0              # kg CO2 per month
    }
}

def calculate_footprint(
    travel_dist: float,
    transport_mode: str,
    electricity_bill: float,
    food_preference: str,
    shopping_freq: str,
    household_size: int
) -> dict:
    # 1. Transportation: daily travel dist * 30 days * factor
    factor = EMISSION_FACTORS["transport"].get(transport_mode, 0.22)
    co2_transport = travel_dist * 30.0 * factor

    # 2. Electricity: assumption that 1 currency unit is 1.2 kWh.
    # Grid average factor: 0.5 kg CO2 / kWh.
    # Total household electricity emissions = bill * 1.2 * 0.5 = bill * 0.6
    # Share per capita = total / household_size
    co2_electricity = (electricity_bill * 0.6) / max(1, household_size)

    # 3. Food emissions
    co2_food = EMISSION_FACTORS["food"].get(food_preference, 180.0)

    # 4. Shopping emissions
    co2_shopping = EMISSION_FACTORS["shopping"].get(shopping_freq, 75.0)

    # Total CO2 per month (kg CO2)
    co2_total = co2_transport + co2_electricity + co2_food + co2_shopping

    # Sustainability Score (0-100)
    # Target low carbon footprint is 100 kg CO2 / month or less.
    # High is 600 kg CO2 / month or more.
    # Score starts at 100 and drops as footprint increases.
    score_float = 100.0 - (co2_total / 800.0) * 100.0
    sustainability_score = max(0.0, min(100.0, round(score_float, 1)))

    return {
        "co2_transport": round(co2_transport, 2),
        "co2_electricity": round(co2_electricity, 2),
        "co2_food": round(co2_food, 2),
        "co2_shopping": round(co2_shopping, 2),
        "co2_total": round(co2_total, 2),
        "sustainability_score": sustainability_score
    }

def get_badge_level(score: float) -> str:
    if score >= 85:
        return "🏆 Climate Hero"
    elif score >= 65:
        return "🌳 Carbon Champion"
    elif score >= 45:
        return "🌿 Eco Explorer"
    else:
        return "🌱 Green Starter"
