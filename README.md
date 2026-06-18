# GreenGuide AI — Your Sustainability Assistant & Digital Twin

**Chosen Vertical**: Sustainability & Environment

[![Netlify Status](https://api.netlify.com/api/v1/badges/elegant-parfait-4cc2a7/deploy-status)](https://app.netlify.com/projects/elegant-parfait-4cc2a7/deploys)

🌐 **Live Demo**: [https://elegant-parfait-4cc2a7.netlify.app](https://elegant-parfait-4cc2a7.netlify.app)

GreenGuide AI is a personal carbon footprint tracking, forecasting, and reduction assistant designed to empower users to understand and minimize their environmental impact. Using a playfull yet professional **Neo-Brutalism UI** design, the application bridges the gap between calculating emissions and taking actionable steps to live a carbon-conscious life.

---


## Problem Statement

While many individuals are aware of climate change, they struggle to quantify their personal impact or understand which lifestyle choices make the biggest difference. Traditional carbon calculators are often static, offering single calculations with generic, unhelpful advice. Users need a personalized, context-aware tool that can:
1. Break down personal emissions dynamically.
2. Predict future changes based on "what-if" lifestyle simulations.
3. Keep them accountable via monthly budgets.
4. Answer natural language queries contextually.

---

## Solution Overview

GreenGuide AI acts as an interactive sustainability coach. It features:
* **Footprint Calculator**: Dynamic tracking across transport, home energy, food, and shopping.
* **AI Recommendation Engine**: Rule-based logic targeting the user's highest emission sectors with carbon and cost savings forecasts.
* **Digital Twin Lite**: A simulator where users slide variables (e.g., vegetarian days, transit choices) to forecast annual savings.
* **Carbon Budgets**: Category-based budget limits with threshold warnings.
* **Smart Sustainability Assistant**: A chatbot that reasons dynamically using the user's actual profile statistics.
* **Sustainable Shopping Advisor**: Product carbon footprint estimations and eco-friendly recommendations.
* **Community Dashboard Hub**: Shared progress trackers and live savings ticker.
* **Progress trends**: Visual Recharts bar graph indicating footprint decreases over time.

---

## Architecture

The project follows a decoupled, modular full-stack architecture:

```
c3/
├── frontend/             # React (Vite) + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/   # Modular UI components (Calculator, Budget, Assistant, etc.)
│   │   ├── types.ts      # Shared TypeScript interface definitions
│   │   ├── App.tsx       # State engine & Tab view routing
│   │   ├── index.css     # Global styles & Tailwind directives
│   │   └── main.tsx      # Application entrypoint
│   └── package.json
│
├── backend/              # Python FastAPI
│   ├── app/
│   │   ├── core/         # SQLite DB & session setup
│   │   ├── models/       # SQLAlchemy database schemas
│   │   ├── schemas/      # Pydantic schema request/response validation
│   │   ├── services/     # Pure carbon calculations and recommendation algorithms
│   │   ├── tests/        # Pytest test cases
│   │   └── main.py       # API router and CORS configuration
│   └── requirements.txt
│
└── README.md
```

---

## How It Works

1. **Calculations**: Standard carbon coefficients from the EPA and IPCC are utilized:
   - **Transportation**: Daily travel distance * 30 * mode coefficient (Petrol Car: `0.22`, Diesel Car: `0.19`, EV: `0.05`, Public Transit: `0.08`).
   - **Electricity**: Household monthly bill * 0.6 per occupant (assuming average grid emission rates).
   - **Food**: Monthly footprint based on dietary preference (Meat-heavy: `250 kg`, Vegetarian: `100 kg`, Vegan: `60 kg`).
   - **Shopping**: Based on consumer frequency (High: `150 kg`, Medium: `75 kg`, Low: `25 kg`).
2. **Contextual Chat Reasoning**: The Smart Coach endpoint parses the user query and links it directly to the user's latest logged footprint statistics, offering highly custom feedback (e.g., calculating exactly how much carbon they would save if they transitioned away from their petrol car).

---

## Assumptions

* Currency is represented in USD or equivalent local values.
* The per-capita electricity emission factor assumes a household share of standard consumer bills.
* User data is kept secure in a local SQLite file (`greenguide.db`) in a single-user configuration, ideal for private local tracking.

---

## Installation Steps

### Prerequisites
* Python 3.10+
* Node.js 18+

### 1. Setup Backend
```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Setup Frontend
```bash
# Navigate to frontend folder
cd ../frontend

# Install dependencies
npm install
```

---

## Running the Project

Ensure you are running both servers simultaneously:

### Start Backend (FastAPI)
```bash
cd backend
# Make sure virtual environment is active
uvicorn app.main:app --reload --port 8000
```
*API will run at http://localhost:8000*

### Start Frontend (Vite)
```bash
cd frontend
npm run dev
```
*Frontend will run at http://localhost:5173*

---

## Testing Instructions

To run the full suite of backend calculations and recommendation tests:

```bash
# Navigate to root directory
cd c3

# Set PYTHONPATH and run pytest
# On Windows PowerShell:
$env:PYTHONPATH="."
backend\venv\Scripts\python -m pytest backend/app/tests/ -v

# On macOS/Linux/Bash:
export PYTHONPATH="."
./backend/venv/bin/python -m pytest backend/app/tests/ -v
```

---

## Future Enhancements

* **Integrate Real-Time Smart Metering**: APIs to sync actual utility smart meters.
* **Gamification and Leaderboards**: Add local community goals, challenges, and shareable social media badges.
* **Expanded Shopping Database**: Barcode scanner for instant shopping carbon footprint reviews.
