from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models import models
from backend.app.schemas import schemas

router = APIRouter(prefix="/api", tags=["chat"])

@router.post("/chat", response_model=schemas.ChatQueryResponse)
def api_chat(payload: schemas.ChatQueryRequest, db: Session = Depends(get_db)):
    msg = payload.message.lower()
    
    latest = db.query(models.UserFootprint).filter(models.UserFootprint.user_id == "default_user").order_by(models.UserFootprint.created_at.desc()).first()
    budget = db.query(models.UserBudget).filter(models.UserBudget.user_id == "default_user").first()
    
    travel_dist = latest.travel_dist if latest else 20.0
    transport_mode = latest.transport_mode if latest else "car_petrol"
    co2_total = latest.co2_total if latest else 400.0
    co2_transport = latest.co2_transport if latest else 150.0
    co2_electricity = latest.co2_electricity if latest else 90.0
    co2_food = latest.co2_food if latest else 100.0
    co2_shopping = latest.co2_shopping if latest else 60.0
    
    score = latest.sustainability_score if latest else 50.0
    
    insights = []
    
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
