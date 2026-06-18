from backend.app.services.calculator import calculate_footprint, get_badge_level

def test_calculate_footprint_basic():
    # Test average input profile
    res = calculate_footprint(
        travel_dist=20.0,
        transport_mode="car_petrol",
        electricity_bill=100.0,
        food_preference="meat_medium",
        shopping_freq="medium",
        household_size=2
    )
    
    # Check that all keys are present
    assert "co2_transport" in res
    assert "co2_electricity" in res
    assert "co2_food" in res
    assert "co2_shopping" in res
    assert "co2_total" in res
    assert "sustainability_score" in res
    
    # Check calculations
    # Transport: 20 * 30 * 0.22 = 132.0
    assert res["co2_transport"] == 132.0
    
    # Electricity: (100 * 0.6) / 2 = 30.0
    assert res["co2_electricity"] == 30.0
    
    # Food: meat_medium = 180.0
    assert res["co2_food"] == 180.0
    
    # Shopping: medium = 75.0
    assert res["co2_shopping"] == 75.0
    
    # Total: 132 + 30 + 180 + 75 = 417.0
    assert res["co2_total"] == 417.0
    
    # Score: 100 - (417/800)*100 = 100 - 52.125 = 47.9
    assert res["sustainability_score"] == 47.9

def test_calculate_footprint_zero():
    # Zero input profile
    res = calculate_footprint(
        travel_dist=0,
        transport_mode="walk",
        electricity_bill=0,
        food_preference="vegan",
        shopping_freq="low",
        household_size=1
    )
    
    assert res["co2_transport"] == 0
    assert res["co2_electricity"] == 0
    assert res["co2_food"] == 60.0
    assert res["co2_shopping"] == 25.0
    assert res["co2_total"] == 85.0
    
    # Score: 100 - (85/800)*100 = 100 - 10.625 = 89.4
    assert res["sustainability_score"] == 89.4

def test_badge_level():
    assert get_badge_level(90) == "🏆 Climate Hero"
    assert get_badge_level(75) == "🌳 Carbon Champion"
    assert get_badge_level(55) == "🌿 Eco Explorer"
    assert get_badge_level(30) == "🌱 Green Starter"
