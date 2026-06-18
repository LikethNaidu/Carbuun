from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class FootprintCreate(BaseModel):
    travel_dist: float = Field(..., ge=0, description="Daily travel distance in km")
    transport_mode: str = Field(..., description="Mode of transport: car_petrol, car_diesel, car_ev, public_transport, bicycle, walk")
    electricity_bill: float = Field(..., ge=0, description="Monthly electricity bill in local currency/units")
    food_preference: str = Field(..., description="Food preference: meat_heavy, meat_medium, vegetarian, vegan")
    shopping_freq: str = Field(..., description="Shopping frequency: high, medium, low")
    household_size: int = Field(..., ge=1, description="Household size")

class FootprintResponse(BaseModel):
    id: int
    user_id: str
    travel_dist: float
    transport_mode: str
    electricity_bill: float
    food_preference: str
    shopping_freq: str
    household_size: int
    co2_transport: float
    co2_electricity: float
    co2_food: float
    co2_shopping: float
    co2_total: float
    sustainability_score: float
    created_at: datetime

    class Config:
        from_attributes = True

class BudgetUpdate(BaseModel):
    budget_transport: float = Field(..., ge=0)
    budget_electricity: float = Field(..., ge=0)
    budget_food: float = Field(..., ge=0)
    budget_shopping: float = Field(..., ge=0)

class BudgetResponse(BaseModel):
    user_id: str
    budget_transport: float
    budget_electricity: float
    budget_food: float
    budget_shopping: float
    updated_at: datetime

    class Config:
        from_attributes = True

class RecommendationItem(BaseModel):
    category: str
    text: str
    carbon_saving: float  # kg CO2/month
    cost_saving: float    # $/month (approx)
    difficulty: str       # Easy, Medium, Hard

class SimulationRequest(BaseModel):
    # What-if overrides
    public_transport_days: Optional[int] = Field(None, ge=0, le=7)
    electricity_reduction_pct: Optional[float] = Field(None, ge=0, le=100)
    vegetarian_days: Optional[int] = Field(None, ge=0, le=7)

class SimulationResponse(BaseModel):
    original_co2: float
    new_co2: float
    reduction_pct: float
    annual_saving_co2: float
    annual_saving_cost: float

class ShoppingAdviceRequest(BaseModel):
    category: str = Field(..., description="Category of product: Shoes, Clothing, Electronics")

class ShoppingAdviceResponse(BaseModel):
    category: str
    estimated_impact: str
    co2_estimate: float # kg CO2
    alternatives: List[dict]
    explanation: str

class ChatQueryRequest(BaseModel):
    message: str

class ChatQueryResponse(BaseModel):
    reply: str
    insights: List[str]

class CommunityStatsResponse(BaseModel):
    total_users: int
    average_score: float
    total_carbon_saved: float # kg CO2
