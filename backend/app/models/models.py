import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class UserFootprint(Base):
    __tablename__ = "user_footprints"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, default="default_user")
    
    # Inputs
    travel_dist = Column(Float, nullable=False)
    transport_mode = Column(String, nullable=False)
    electricity_bill = Column(Float, nullable=False)
    food_preference = Column(String, nullable=False)
    shopping_freq = Column(String, nullable=False)
    household_size = Column(Integer, nullable=False)
    
    # Calculated CO2 (kg CO2 / month)
    co2_transport = Column(Float, nullable=False)
    co2_electricity = Column(Float, nullable=False)
    co2_food = Column(Float, nullable=False)
    co2_shopping = Column(Float, nullable=False)
    co2_total = Column(Float, nullable=False)
    
    # Metrics
    sustainability_score = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class UserBudget(Base):
    __tablename__ = "user_budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True, default="default_user")
    
    # Monthly budgets (kg CO2 / month)
    budget_transport = Column(Float, default=150.0)
    budget_electricity = Column(Float, default=100.0)
    budget_food = Column(Float, default=100.0)
    budget_shopping = Column(Float, default=50.0)
    
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
