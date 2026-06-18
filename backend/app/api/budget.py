from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import datetime

from backend.app.core.database import get_db
from backend.app.models import models
from backend.app.schemas import schemas

router = APIRouter(prefix="/api", tags=["budget"])

@router.get("/budget", response_model=schemas.BudgetResponse)
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

@router.put("/budget", response_model=schemas.BudgetResponse)
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
