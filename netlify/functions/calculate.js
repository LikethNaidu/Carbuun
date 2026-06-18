// Carbon emission calculation logic — mirrors backend/app/services/calculator.py
const EMISSION_FACTORS = {
  transport: {
    car_petrol: 0.22,
    car_diesel: 0.19,
    car_ev: 0.05,
    public_transport: 0.08,
    bicycle: 0.0,
    walk: 0.0,
  },
  food: {
    meat_heavy: 250.0,
    meat_medium: 180.0,
    vegetarian: 100.0,
    vegan: 60.0,
  },
  shopping: {
    high: 150.0,
    medium: 75.0,
    low: 25.0,
  },
};

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || "";
  const allowedOrigins = [
    "https://elegant-parfait-4cc2a7.netlify.app",
    "http://localhost:5173",
    "http://localhost:3000"
  ];
  const allowOrigin = allowedOrigins.includes(origin) ? origin : "https://elegant-parfait-4cc2a7.netlify.app";

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "Content-Type",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ detail: "Method not allowed" }) };

  try {
    const body = JSON.parse(event.body || "{}");
    const travel_dist = parseFloat(body.travel_dist) || 0;
    const transport_mode = String(body.transport_mode || "car_petrol").trim();
    const electricity_bill = parseFloat(body.electricity_bill) || 0;
    const food_preference = String(body.food_preference || "meat_medium").trim();
    const shopping_freq = String(body.shopping_freq || "medium").trim();
    const household_size = Math.max(1, parseInt(body.household_size) || 1);

    if (travel_dist < 0 || electricity_bill < 0 || household_size < 1) {
      return { statusCode: 422, headers, body: JSON.stringify({ detail: "Invalid input values" }) };
    }

    const factor = EMISSION_FACTORS.transport[transport_mode] ?? 0.22;
    const co2_transport = Math.round(travel_dist * 30.0 * factor * 100) / 100;
    const co2_electricity = Math.round((electricity_bill * 0.6) / household_size * 100) / 100;
    const co2_food = EMISSION_FACTORS.food[food_preference] ?? 180.0;
    const co2_shopping = EMISSION_FACTORS.shopping[shopping_freq] ?? 75.0;
    const co2_total = Math.round((co2_transport + co2_electricity + co2_food + co2_shopping) * 100) / 100;

    const score_raw = 100.0 - (co2_total / 800.0) * 100.0;
    const sustainability_score = Math.max(0, Math.min(100, Math.round(score_raw * 10) / 10));

    const result = {
      id: Date.now(),
      user_id: "default_user",
      travel_dist, transport_mode, electricity_bill, food_preference, shopping_freq, household_size,
      co2_transport, co2_electricity, co2_food, co2_shopping, co2_total, sustainability_score,
      created_at: new Date().toISOString(),
    };

    return { statusCode: 200, headers, body: JSON.stringify(result) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ detail: e.message }) };
  }
};
