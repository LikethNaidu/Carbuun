from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.database import engine, Base
from backend.app.api.calculator import router as calculator_router
from backend.app.api.budget import router as budget_router
from backend.app.api.recommendations import router as recommendations_router
from backend.app.api.simulator import router as simulator_router
from backend.app.api.shopping import router as shopping_router
from backend.app.api.chat import router as chat_router
from backend.app.api.community import router as community_router

app = FastAPI(title="GreenGuide AI API", version="1.0.0")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://elegant-parfait-4cc2a7.netlify.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database startup: create tables
@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)

# Include modular API routers
app.include_router(calculator_router)
app.include_router(budget_router)
app.include_router(recommendations_router)
app.include_router(simulator_router)
app.include_router(shopping_router)
app.include_router(chat_router)
app.include_router(community_router)
