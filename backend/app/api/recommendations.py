from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from backend.app.core.database import get_db
from backend.app.models import models
from backend.app.schemas import schemas
from backend.app.services.recommendations import generate_recommendations

router = APIRouter(prefix="/api", tags=["recommendations"])

@router.get("/recommendations", response_model=List[schemas.RecommendationItem])
def api_recommendations(db: Session = Depends(get_db)):
    latest = db.query(models.UserFootprint).filter(models.UserFootprint.user_id == "default_user").order_by(models.UserFootprint.created_at.desc()).first()
    
    if not latest:
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
