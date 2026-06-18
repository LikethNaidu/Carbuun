from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import datetime

from backend.app.core.database import get_db
from backend.app.models import models
from backend.app.schemas import schemas
from backend.app.services.calculator import calculate_footprint

router = APIRouter(prefix="/api", tags=["calculator"])

@router.post("/calculate", response_model=schemas.FootprintResponse)
def api_calculate(payload: schemas.FootprintCreate, db: Session = Depends(get_db)):
    res = calculate_footprint(
        travel_dist=payload.travel_dist,
        transport_mode=payload.transport_mode,
        electricity_bill=payload.electricity_bill,
        food_preference=payload.food_preference,
        shopping_freq=payload.shopping_freq,
        household_size=payload.household_size
    )
    
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

@router.get("/history", response_model=List[schemas.FootprintResponse])
def api_history(db: Session = Depends(get_db)):
    entries = db.query(models.UserFootprint).filter(models.UserFootprint.user_id == "default_user").order_by(models.UserFootprint.created_at.asc()).all()
    
    if not entries:
        seeded_entries = []
        now = datetime.datetime.utcnow()
        for i in range(4):
            months_ago = 4 - i
            created_at = now - datetime.timedelta(days=30 * months_ago)
            
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
