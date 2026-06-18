from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models import models
from backend.app.schemas import schemas

router = APIRouter(prefix="/api", tags=["simulator"])

@router.post("/simulate", response_model=schemas.SimulationResponse)
def api_simulate(payload: schemas.SimulationRequest, db: Session = Depends(get_db)):
    latest = db.query(models.UserFootprint).filter(models.UserFootprint.user_id == "default_user").order_by(models.UserFootprint.created_at.desc()).first()
    if not latest:
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
    sim_co2_transport = latest.co2_transport
    sim_co2_electricity = latest.co2_electricity
    sim_co2_food = latest.co2_food
    sim_co2_shopping = latest.co2_shopping
    
    cost_savings = 0.0
    
    if payload.public_transport_days is not None and payload.public_transport_days > 0:
        days = payload.public_transport_days
        if latest.transport_mode in ["car_petrol", "car_diesel"]:
            car_factor = 0.22 if latest.transport_mode == "car_petrol" else 0.19
            pt_factor = 0.08
            original_daily = latest.travel_dist * car_factor
            pt_daily = latest.travel_dist * pt_factor
            
            savings_per_day = (original_daily - pt_daily) * 4.3
            sim_co2_transport = max(0.0, latest.co2_transport - (savings_per_day * days))
            cost_savings += (latest.travel_dist * 0.15 - 3.0) * days * 4.3
            
    if payload.electricity_reduction_pct is not None and payload.electricity_reduction_pct > 0:
        pct = payload.electricity_reduction_pct
        reduction = latest.co2_electricity * (pct / 100.0)
        sim_co2_electricity = max(0.0, latest.co2_electricity - reduction)
        cost_savings += (latest.electricity_bill / max(1, latest.household_size)) * (pct / 100.0)
        
    if payload.vegetarian_days is not None and payload.vegetarian_days > 0:
        days = payload.vegetarian_days
        if latest.food_preference in ["meat_heavy", "meat_medium"]:
            saving_per_meal = 7.1 if latest.food_preference == "meat_heavy" else 3.8
            sim_co2_food = max(60.0, latest.co2_food - (saving_per_meal * days * 4.3))
            cost_savings += 2.5 * days * 4.3

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
