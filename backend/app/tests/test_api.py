import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.main import app
from backend.app.core.database import Base, get_db
from backend.app.models import models

# Create a shared file database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def client():
    # Create the database tables
    Base.metadata.create_all(bind=engine)
    
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()
            
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    # Clean up tables and database file
    Base.metadata.drop_all(bind=engine)
    import os
    try:
        if os.path.exists("./test.db"):
            os.remove("./test.db")
    except Exception:
        pass

def test_get_default_budget(client):
    # Test GET /api/budget returns defaults
    response = client.get("/api/budget")
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == "default_user"
    assert data["budget_transport"] == 150.0
    assert data["budget_electricity"] == 80.0
    assert data["budget_food"] == 120.0
    assert data["budget_shopping"] == 60.0

def test_update_budget(client):
    # Test PUT /api/budget
    payload = {
        "budget_transport": 180.0,
        "budget_electricity": 95.0,
        "budget_food": 110.0,
        "budget_shopping": 70.0
    }
    response = client.put("/api/budget", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["budget_transport"] == 180.0
    assert data["budget_electricity"] == 95.0
    assert data["budget_food"] == 110.0
    assert data["budget_shopping"] == 70.0

def test_calculate_and_history(client):
    # Test POST /api/calculate
    payload = {
        "travel_dist": 20.0,
        "transport_mode": "car_petrol",
        "electricity_bill": 100.0,
        "food_preference": "meat_medium",
        "shopping_freq": "medium",
        "household_size": 2
    }
    response = client.post("/api/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == "default_user"
    assert "co2_total" in data
    assert data["co2_total"] > 0
    assert "sustainability_score" in data

    # Test GET /api/history returns our calculated entry
    history_response = client.get("/api/history")
    assert history_response.status_code == 200
    history_data = history_response.json()
    assert len(history_data) >= 1
    assert history_data[-1]["travel_dist"] == 20.0
    assert history_data[-1]["transport_mode"] == "car_petrol"

def test_chat_greeting(client):
    # Test POST /api/chat with hello greeting
    payload = {
        "message": "Hello green guide assistant!"
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert "sustainability coach" in data["reply"].lower()
    assert len(data["insights"]) > 0

def test_chat_transport(client):
    # Test POST /api/chat querying about transit
    payload = {
        "message": "How is my travel emissions looking?"
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert len(data["insights"]) > 0

def test_shopping_advisor(client):
    # Test POST /api/shopping with a clothing product
    payload = {
        "category": "shoes"
    }
    response = client.post("/api/shopping", json=payload)
    assert response.status_code == 200
    assert response.headers.get("Cache-Control") == "public, max-age=3600"
    data = response.json()
    assert data["category"] == "Shoes"
    assert "estimated_impact" in data
    assert len(data["alternatives"]) > 0
    assert "Allbirds" in data["alternatives"][0]["name"]

def test_simulator_twin(client):
    # Test POST /api/simulate with some reduction inputs
    payload = {
        "public_transport_days": 3,
        "electricity_reduction_pct": 20.0,
        "vegetarian_days": 2
    }
    response = client.post("/api/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "original_co2" in data
    assert "new_co2" in data
    assert "reduction_pct" in data
    assert data["reduction_pct"] > 0
    assert data["annual_saving_co2"] > 0

def test_community_stats(client):
    # Test GET /api/community
    response = client.get("/api/community")
    assert response.status_code == 200
    assert response.headers.get("Cache-Control") == "public, max-age=3600"
    data = response.json()
    assert "total_users" in data
    assert "average_score" in data
    assert "total_carbon_saved" in data
    assert data["total_users"] > 0

def test_chat_comparison(client):
    # Test POST /api/chat requesting comparison info
    payload = {
        "message": "how does my footprint compare to the average?"
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert "global average" in data["reply"].lower()
    assert "sustainable limit" in data["reply"].lower()
    assert len(data["insights"]) > 0
