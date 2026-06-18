from backend.app.services.recommendations import generate_recommendations

def test_recommendations_heavy_emitter():
    # Test user with high emissions
    recs = generate_recommendations(
        co2_transport=200.0,
        co2_electricity=120.0,
        co2_food=250.0,
        co2_shopping=150.0,
        food_preference="meat_heavy",
        transport_mode="car_petrol",
        shopping_freq="high"
    )
    
    assert len(recs) > 0
    
    # Check that recommendations target high emissions
    categories = [r.category for r in recs]
    assert "Transportation" in categories
    assert "Electricity" in categories
    assert "Food" in categories
    assert "Shopping" in categories
    
    # Transport rec check for petrol car
    pt_recs = [r for r in recs if r.category == "Transportation" and "public transport" in r.text]
    assert len(pt_recs) == 1
    assert pt_recs[0].carbon_saving == 50.0 # 200 * 0.25
    assert pt_recs[0].difficulty == "Medium"
    
    # Food rec check for meat heavy
    food_recs = [r for r in recs if r.category == "Food" and "vegetarian" in r.text]
    assert len(food_recs) == 1
    assert food_recs[0].carbon_saving == 80.0
    assert food_recs[0].difficulty == "Easy"

def test_recommendations_low_emitter():
    # Test user with low emissions
    recs = generate_recommendations(
        co2_transport=0.0,
        co2_electricity=10.0,
        co2_food=60.0,
        co2_shopping=25.0,
        food_preference="vegan",
        transport_mode="walk",
        shopping_freq="low"
    )
    
    assert len(recs) > 0
    categories = [r.category for r in recs]
    assert "Transportation" in categories
    assert "Food" in categories
    
    # Check that low emitter gets positive reinforcement recs
    transit_rec = [r for r in recs if r.category == "Transportation"][0]
    assert "Maintain your low-impact" in transit_rec.text
    assert transit_rec.carbon_saving == 5.0
