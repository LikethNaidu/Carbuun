import random
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import datetime

from backend.app.core.database import engine, Base, get_db
from backend.app.models import models
from backend.app.schemas import schemas
from backend.app.services.calculator import calculate_footprint
from backend.app.services.recommendations import generate_recommendations

app = FastAPI(title="GreenGuide AI API", version="1.0.0")

# CORS middleware config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup: create tables
@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)

@app.post("/api/calculate", response_model=schemas.FootprintResponse)
def api_calculate(payload: schemas.FootprintCreate, db: Session = Depends(get_db)):
    # Calculate emissions
    res = calculate_footprint(
        travel_dist=payload.travel_dist,
        transport_mode=payload.transport_mode,
        electricity_bill=payload.electricity_bill,
        food_preference=payload.food_preference,
        shopping_freq=payload.shopping_freq,
        household_size=payload.household_size
    )
    
    # Save to database
    db_entry = models.UserFootprint(
        user_id="default_user",
        travel_dist=payload.travel_dist,
        transport_mode=payload.transport_mode,
        electricity_bill=payload.electricity_bill,
        food_preference=payload.food_preference,
        shopping_freq=payload.shopping_freq,
        household_size=payload.household_size,
        co2_transport=res["co2_transport"],
        co2_electricity=res["co2_electricity"],
        co2_food=res["co2_food"],
        co2_shopping=res["co2_shopping"],
        co2_total=res["co2_total"],
        sustainability_score=res["sustainability_score"]
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@app.get("/api/history", response_model=List[schemas.FootprintResponse])
def api_history(db: Session = Depends(get_db)):
    entries = db.query(models.UserFootprint).filter(models.UserFootprint.user_id == "default_user").order_by(models.UserFootprint.created_at.asc()).all()
    
    # If no history exists, return seeded mock history so charts look beautiful instantly
    if not entries:
        seeded_entries = []
        now = datetime.datetime.utcnow()
        # Seed 4 months of history
        for i in range(4):
            months_ago = 4 - i
            created_at = now - datetime.timedelta(days=30 * months_ago)
            
            # Decrease emissions over time to show positive progress
            travel_dist = 25 - i * 3
            electricity_bill = 120 - i * 10
            food_preference = "meat_heavy" if i == 0 else ("meat_medium" if i < 3 else "vegetarian")
            shopping_freq = "high" if i == 0 else "medium"
            
            res = calculate_footprint(
                travel_dist=travel_dist,
                transport_mode="car_petrol" if i < 2 else "car_ev",
                electricity_bill=electricity_bill,
                food_preference=food_preference,
                shopping_freq=shopping_freq,
                household_size=2
            )
            
            db_entry = models.UserFootprint(
                id=1000 + i,
                user_id="default_user",
                travel_dist=travel_dist,
                transport_mode="car_petrol" if i < 2 else "car_ev",
                electricity_bill=electricity_bill,
                food_preference=food_preference,
                shopping_freq=shopping_freq,
                household_size=2,
                co2_transport=res["co2_transport"],
                co2_electricity=res["co2_electricity"],
                co2_food=res["co2_food"],
                co2_shopping=res["co2_shopping"],
                co2_total=res["co2_total"],
                sustainability_score=res["sustainability_score"],
                created_at=created_at
            )
            seeded_entries.append(db_entry)
        return seeded_entries

    return entries

@app.get("/api/recommendations", response_model=List[schemas.RecommendationItem])
def api_recommendations(db: Session = Depends(get_db)):
    # Fetch latest footprint entry
    latest = db.query(models.UserFootprint).filter(models.UserFootprint.user_id == "default_user").order_by(models.UserFootprint.created_at.desc()).first()
    
    if not latest:
        # Default recommendations if no data entered yet
        return generate_recommendations(
            co2_transport=150.0,
            co2_electricity=80.0,
            co2_food=180.0,
            co2_shopping=75.0,
            food_preference="meat_medium",
            transport_mode="car_petrol",
            shopping_freq="medium"
        )
        
    return generate_recommendations(
        co2_transport=latest.co2_transport,
        co2_electricity=latest.co2_electricity,
        co2_food=latest.co2_food,
        co2_shopping=latest.co2_shopping,
        food_preference=latest.food_preference,
        transport_mode=latest.transport_mode,
        shopping_freq=latest.shopping_freq
    )

@app.get("/api/budget", response_model=schemas.BudgetResponse)
def api_get_budget(db: Session = Depends(get_db)):
    budget = db.query(models.UserBudget).filter(models.UserBudget.user_id == "default_user").first()
    if not budget:
        budget = models.UserBudget(
            user_id="default_user",
            budget_transport=150.0,
            budget_electricity=80.0,
            budget_food=120.0,
            budget_shopping=60.0
        )
        db.add(budget)
        db.commit()
        db.refresh(budget)
    return budget

@app.put("/api/budget", response_model=schemas.BudgetResponse)
def api_update_budget(payload: schemas.BudgetUpdate, db: Session = Depends(get_db)):
    budget = db.query(models.UserBudget).filter(models.UserBudget.user_id == "default_user").first()
    if not budget:
        budget = models.UserBudget(user_id="default_user")
        db.add(budget)
    
    budget.budget_transport = payload.budget_transport
    budget.budget_electricity = payload.budget_electricity
    budget.budget_food = payload.budget_food
    budget.budget_shopping = payload.budget_shopping
    budget.updated_at = datetime.datetime.utcnow()
    
    db.commit()
    db.refresh(budget)
    return budget

@app.post("/api/simulate", response_model=schemas.SimulationResponse)
def api_simulate(payload: schemas.SimulationRequest, db: Session = Depends(get_db)):
    # Get latest footprint entry
    latest = db.query(models.UserFootprint).filter(models.UserFootprint.user_id == "default_user").order_by(models.UserFootprint.created_at.desc()).first()
    if not latest:
        # Generate default baseline if user hasn't calculated yet
        latest = models.UserFootprint(
            travel_dist=20.0,
            transport_mode="car_petrol",
            electricity_bill=100.0,
            food_preference="meat_medium",
            shopping_freq="medium",
            household_size=2,
            co2_transport=132.0,
            co2_electricity=30.0,
            co2_food=180.0,
            co2_shopping=75.0,
            co2_total=417.0,
            sustainability_score=47.9
        )
    
    original_co2 = latest.co2_total
    
    # Calculate simulation modifications
    sim_co2_transport = latest.co2_transport
    sim_co2_electricity = latest.co2_electricity
    sim_co2_food = latest.co2_food
    sim_co2_shopping = latest.co2_shopping
    
    cost_savings = 0.0
    
    # 1. Public Transport days override (Assume original was driving car_petrol/diesel)
    # If using public transport X days a week, we replace X/7 of transport emissions with public transport factors
    if payload.public_transport_days is not None and payload.public_transport_days > 0:
        days = payload.public_transport_days
        # Only apply if user is currently driving a car
        if latest.transport_mode in ["car_petrol", "car_diesel"]:
            car_factor = 0.22 if latest.transport_mode == "car_petrol" else 0.19
            pt_factor = 0.08
            # Daily emissions = travel_dist * factor
            original_daily = latest.travel_dist * car_factor
            pt_daily = latest.travel_dist * pt_factor
            
            # Month calculation adjustment: replace X days/week with public transit
            # monthly = (7 - X)/7 * original_monthly + X/7 * pt_monthly
            savings_per_day = (original_daily - pt_daily) * 4.3 # weeks/month
            sim_co2_transport = max(0.0, latest.co2_transport - (savings_per_day * days))
            # Cost saving: gas saved minus public transport ticket cost
            cost_savings += (latest.travel_dist * 0.15 - 3.0) * days * 4.3  # Approx gas $0.15/km, ticket $3
            
    # 2. Electricity reduction %
    if payload.electricity_reduction_pct is not None and payload.electricity_reduction_pct > 0:
        pct = payload.electricity_reduction_pct
        reduction = latest.co2_electricity * (pct / 100.0)
        sim_co2_electricity = max(0.0, latest.co2_electricity - reduction)
        # Cost saving: assuming electricity bill is directly proportional to emissions
        cost_savings += (latest.electricity_bill / max(1, latest.household_size)) * (pct / 100.0)
        
    # 3. Vegetarian meals per week (out of 21 meals)
    # Average diet has 21 meals. Heavy meat diet emissions = 250 kg/mo (~12kg/meal).
    # Vegetarian emissions = 100 kg/mo (~4.7kg/meal). Vegan = 60 kg/mo (~2.8kg/meal).
    # Saving per meal swapped = (meat_heavy - vegetarian)/21 = ~7.1 kg CO2/meal.
    if payload.vegetarian_days is not None and payload.vegetarian_days > 0:
        days = payload.vegetarian_days
        # Assuming 1 meat meal replaced per vegetarian day (so 1 meal per day)
        if latest.food_preference in ["meat_heavy", "meat_medium"]:
            saving_per_meal = 7.1 if latest.food_preference == "meat_heavy" else 3.8
            sim_co2_food = max(60.0, latest.co2_food - (saving_per_meal * days * 4.3))
            # Cost savings: vegetarian diets are usually slightly cheaper
            cost_savings += 2.5 * days * 4.3 # $2.5 savings per day

    new_co2 = sim_co2_transport + sim_co2_electricity + sim_co2_food + sim_co2_shopping
    reduction_pct = round(((original_co2 - new_co2) / max(1.0, original_co2)) * 100.0, 1)
    
    annual_saving_co2 = round((original_co2 - new_co2) * 12.0, 2)
    annual_saving_cost = round(max(0.0, cost_savings) * 12.0, 2)
    
    return schemas.SimulationResponse(
        original_co2=round(original_co2, 2),
        new_co2=round(new_co2, 2),
        reduction_pct=reduction_pct,
        annual_saving_co2=annual_saving_co2,
        annual_saving_cost=annual_saving_cost
    )

@app.post("/api/shopping", response_model=schemas.ShoppingAdviceResponse)
def api_shopping(payload: schemas.ShoppingAdviceRequest):
    cat = payload.category.lower().strip()
    
    if "shoe" in cat:
        return schemas.ShoppingAdviceResponse(
            category="Shoes",
            estimated_impact="High. Traditional leather and synthetic sneakers generate substantial carbon footprint during manufacturing and supply chain transit.",
            co2_estimate=14.5,
            explanation="Standard running shoes require energy-intensive synthetic polymers, petroleum-based glues, and overseas air/freight logistics.",
            alternatives=[
                {"name": "Allbirds Wool Runners", "co2": 9.9, "desc": "Made from renewable Merino wool and sugarcane-based SweetFoam soles. Climate neutral.", "better_because": "Renewable natural fibers instead of synthetic plastics."},
                {"name": "Veja Organic Canvas Sneaker", "co2": 8.0, "desc": "Features wild Amazonian rubber and organic cotton canvas.", "better_because": "Sourced from agro-ecological farms, fair trade rubber."}
            ]
        )
    elif "clothing" in cat or "apparel" in cat or "shirt" in cat or "jeans" in cat:
        return schemas.ShoppingAdviceResponse(
            category="Clothing",
            estimated_impact="Medium to High. Fast fashion relies on synthetic fibers (polyester) and excessive pesticide water-use (conventional cotton).",
            co2_estimate=8.2,
            explanation="Polyester is a form of plastic derived from petroleum. Washing it also releases microplastics into marine ecosystems.",
            alternatives=[
                {"name": "Organic Cotton T-Shirt", "co2": 3.1, "desc": "Uses non-GMO seeds and 90% less water than traditional cotton.", "better_because": "Eliminates toxic fertilizers and reduces farming energy output."},
                {"name": "Recycled Polyester Windbreaker", "co2": 4.5, "desc": "Repurposes ocean-bound plastic bottles into durable outdoor clothing.", "better_because": "Requires 59% less energy to produce than virgin polyester."}
            ]
        )
    elif "electronic" in cat or "phone" in cat or "laptop" in cat or "device" in cat:
        return schemas.ShoppingAdviceResponse(
            category="Electronics",
            estimated_impact="Extremely High. Rare earth mineral mining, battery smelting, and precision manufacturing make electronics massive carbon emitters.",
            co2_estimate=80.0,
            explanation="Over 80% of a smartphone's lifetime emissions occur during manufacturing and extraction of cobalt, gold, and lithium.",
            alternatives=[
                {"name": "Fairphone 5", "co2": 35.0, "desc": "Designed with highly modular parts for easy home-repair. Fairtrade gold and recycled plastics.", "better_because": "Modular repairability extends product life, slashing manufacturing replacement cycle."},
                {"name": "Refurbished Premium Laptop", "co2": 15.0, "desc": "Pre-owned laptop fully restored to factory specs. Prevents e-waste.", "better_because": "Displaces emissions of a new factory build by extending existing hardware utility."}
            ]
        )
    else:
        # Catch-all
        return schemas.ShoppingAdviceResponse(
            category=payload.category,
            estimated_impact="Medium. Standard products consume raw resources and shipping fuels.",
            co2_estimate=20.0,
            explanation="General manufacturing relies heavily on industrial grids powered by fossil fuels.",
            alternatives=[
                {"name": "Locally-sourced Alternative", "co2": 5.0, "desc": "Item manufactured within 100 miles using local materials.", "better_because": "Eliminates global shipping cargo emissions."},
                {"name": "Secondhand/Used Option", "co2": 0.5, "desc": "Purchased from a local thrift store or online resale portal.", "better_because": "Zero manufacturing carbon footprint, diverts items from landfills."}
            ]
        )

@app.post("/api/chat", response_model=schemas.ChatQueryResponse)
def api_chat(payload: schemas.ChatQueryRequest, db: Session = Depends(get_db)):
    msg = payload.message.lower()
    
    # Load user details to personalize reasoning
    latest = db.query(models.UserFootprint).filter(models.UserFootprint.user_id == "default_user").order_by(models.UserFootprint.created_at.desc()).first()
    budget = db.query(models.UserBudget).filter(models.UserBudget.user_id == "default_user").first()
    
    # Baseline defaults if user hasn't filled anything yet
    travel_dist = latest.travel_dist if latest else 20.0
    transport_mode = latest.transport_mode if latest else "car_petrol"
    co2_total = latest.co2_total if latest else 400.0
    co2_transport = latest.co2_transport if latest else 150.0
    co2_electricity = latest.co2_electricity if latest else 90.0
    co2_food = latest.co2_food if latest else 100.0
    co2_shopping = latest.co2_shopping if latest else 60.0
    
    score = latest.sustainability_score if latest else 50.0
    
    # Build personalized context for the agent
    insights = []
    
    # 1. Smart assistant contextual response logic
    if "hello" in msg or "hi" in msg or "greet" in msg:
        reply = (
            f"Hello! I am GreenGuide AI, your sustainability coach. I've analyzed your profile. "
            f"Your current sustainability score is **{score}/100**. "
        )
        if score > 75:
            reply += "You are doing fantastic! Let's explore how to push you even closer to becoming a Climate Hero."
        elif score > 50:
            reply += "You are on the right track (Eco Explorer/Carbon Champion status). There are a few moderate adjustments we can discuss to lower your carbon footprint."
        else:
            reply += "We have some work to do, but don't worry! I can help you target your highest emissions first."
            
        insights.append(f"Sustainability Score: {score}")
        
    elif "travel" in msg or "transport" in msg or "car" in msg or "drive" in msg or "commuting" in msg:
        if transport_mode in ["car_petrol", "car_diesel"] and travel_dist > 15:
            reply = (
                f"I noticed you commute **{travel_dist} km/day** by petrol/diesel car. "
                f"This generates **{co2_transport:.1f} kg CO2/month**, which is your largest footprint component. "
                "If you can switch to public transport or carpool just twice a week, you'd save approximately "
                f"**{co2_transport * 0.28:.1f} kg CO2/month**. Biking or walking for trips under 3 km would also make a huge dent."
            )
            insights.append("High transport emissions detected.")
        else:
            reply = (
                f"Your transportation emissions are already quite low at **{co2_transport:.1f} kg CO2/month** "
                f"since you use {transport_mode.replace('_', ' ')}. Excellent work! You should focus your efforts on other areas "
                f"like food consumption or home energy use."
            )
            insights.append("Low transport emissions. Recommend focusing on energy/food.")
            
    elif "electric" in msg or "energy" in msg or "power" in msg or "bill" in msg or "light" in msg:
        if co2_electricity > 70:
            reply = (
                f"Your monthly household electricity emissions are **{co2_electricity:.1f} kg CO2/month**. "
                "Since this is a significant part of your footprint, I recommend starting with low-cost efficiency upgrades. "
                "Replacing standard lightbulbs with LEDs, using smart power strips to block standby power, and lowering your "
                "thermostat by 2 degrees can immediately save you around 10-15% of energy costs and carbon output."
            )
            insights.append("High energy emissions detected.")
        else:
            reply = (
                f"Your electricity emissions are currently **{co2_electricity:.1f} kg CO2/month**, which is very efficient. "
                "To reduce this even further, check for 'phantom loads' (appliances that consume power when plugged in but turned off) "
                "or consider asking your utility provider if they offer a 100% renewable energy enrollment plan."
            )
            insights.append("Electricity consumption is within moderate range.")
            
    elif "food" in msg or "diet" in msg or "meat" in msg or "eat" in msg or "vegan" in msg or "vegetarian" in msg:
        if latest and latest.food_preference in ["meat_heavy", "meat_medium"]:
            saving = 80.0 if latest.food_preference == "meat_heavy" else 40.0
            reply = (
                f"Your food footprint is **{co2_food:.1f} kg CO2/month** due to your meat-inclusive diet. "
                f"Transitioning to vegetarian meals just 3 days a week could save around **{saving:.1f} kg CO2/month**. "
                "Adding more lentils, beans, and locally grown vegetables to your weekly meal prep is also a great way to save money!"
            )
            insights.append("Diet emissions present opportunity for reduction.")
        else:
            reply = (
                f"Your diet is plant-based, keeping food emissions at a low **{co2_food:.1f} kg CO2/month**. "
                "This is one of the most powerful individual choices you can make for the planet! "
                "To optimize further, focus on minimizing food waste by organizing your pantry and freezing leftovers."
            )
            insights.append("Plant-based diet is highly optimal.")
            
    elif "budget" in msg or "limit" in msg or "allowance" in msg:
        if budget:
            status_text = ""
            over_budget = []
            if co2_transport > budget.budget_transport:
                over_budget.append(f"Transportation (+{co2_transport - budget.budget_transport:.1f} kg)")
            if co2_electricity > budget.budget_electricity:
                over_budget.append(f"Electricity (+{co2_electricity - budget.budget_electricity:.1f} kg)")
            if co2_food > budget.budget_food:
                over_budget.append(f"Food (+{co2_food - budget.budget_food:.1f} kg)")
            if co2_shopping > budget.budget_shopping:
                over_budget.append(f"Shopping (+{co2_shopping - budget.budget_shopping:.1f} kg)")
                
            if over_budget:
                reply = (
                    f"Looking at your carbon budget, you are currently exceeding limits in: {', '.join(over_budget)}. "
                    f"Your total footprint is **{co2_total:.1f} kg CO2/month**, while your combined budget is "
                    f"**{budget.budget_transport + budget.budget_electricity + budget.budget_food + budget.budget_shopping:.1f} kg CO2/month**. "
                    "I suggest focusing on the transport or energy recommendations to bring yourself back inside budget limits."
                )
                insights.append("Budget limits exceeded in specific categories.")
            else:
                reply = (
                    f"Fantastic! You are currently within budget in all categories. "
                    f"Your monthly footprint (**{co2_total:.1f} kg**) is comfortably below your limit of "
                    f"**{budget.budget_transport + budget.budget_electricity + budget.budget_food + budget.budget_shopping:.1f} kg**. "
                    "Keep up the brilliant lifestyle habits!"
                )
                insights.append("All categories are within budget.")
        else:
            reply = "You haven't set up a carbon budget yet. Head over to the Budget tab to set your monthly targets and track your status!"
            insights.append("No active budget found.")
            
    else:
        # Contextual recommendation summaries
        reply = (
            f"Based on your profile, your total carbon footprint is **{co2_total:.1f} kg CO2/month**. "
            f"Your highest emission category is "
            f"{'Transportation' if co2_transport == max(co2_transport, co2_electricity, co2_food, co2_shopping) else ('Electricity' if co2_electricity == max(co2_transport, co2_electricity, co2_food, co2_shopping) else ('Food' if co2_food == max(co2_transport, co2_electricity, co2_food, co2_shopping) else 'Shopping'))}. "
            "To make the biggest impact, you should target this category first. Ask me specifically about "
            "'travel advice', 'reducing energy use', or 'diet adjustments' for a deep dive!"
        )
        insights.append(f"Highest emission component identified.")

    return schemas.ChatQueryResponse(
        reply=reply,
        insights=insights
    )

@app.get("/api/community", response_model=schemas.CommunityStatsResponse)
def api_community(db: Session = Depends(get_db)):
    # Let's dynamically calculate stats
    user_count = db.query(models.UserFootprint.user_id).distinct().count()
    # Add a mock base to simulate a real growing community
    total_users = max(1, user_count) + 1284
    
    # Calculate average score of actual entries + community mock base
    avg_actual = db.query(models.UserFootprint.sustainability_score).all()
    if avg_actual:
        scores = [s[0] for s in avg_actual]
        average_score = round((sum(scores) / len(scores)) * 0.3 + 72.4 * 0.7, 1)
    else:
        average_score = 72.4
        
    # Simulate collective carbon saved
    # Increase over time to make it feel alive!
    base_carbon_saved = 48592.5
    now = datetime.datetime.utcnow()
    # Increment based on seconds since start of the day
    start_of_day = datetime.datetime(now.year, now.month, now.day)
    seconds_passed = (now - start_of_day).total_seconds()
    # Approx 0.15 kg saved per second globally
    total_carbon_saved = round(base_carbon_saved + (seconds_passed * 0.15), 1)
    
    return schemas.CommunityStatsResponse(
        total_users=total_users,
        average_score=average_score,
        total_carbon_saved=total_carbon_saved
    )
