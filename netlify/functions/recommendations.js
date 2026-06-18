// Recommendation engine — mirrors backend/app/services/recommendations.py
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
    const co2_transport = parseFloat(body.co2_transport) || 150;
    const co2_electricity = parseFloat(body.co2_electricity) || 80;
    const co2_food = parseFloat(body.co2_food) || 180;
    const co2_shopping = parseFloat(body.co2_shopping) || 75;
    const food_preference = body.food_preference || "meat_medium";
    const transport_mode = body.transport_mode || "car_petrol";
    const shopping_freq = body.shopping_freq || "medium";

    const recs = [];

    // Transportation
    if (co2_transport > 50) {
      if (["car_petrol", "car_diesel"].includes(transport_mode)) {
        recs.push({ category: "Transportation", text: "Switch to public transport or carpool 2 days a week instead of driving alone.", carbon_saving: Math.round(co2_transport * 0.25 * 10) / 10, cost_saving: 35, difficulty: "Medium" });
        recs.push({ category: "Transportation", text: "Consider upgrading to an electric vehicle (EV) for your daily commutes.", carbon_saving: Math.round(co2_transport * 0.75 * 10) / 10, cost_saving: 90, difficulty: "Hard" });
      } else if (transport_mode === "car_ev") {
        recs.push({ category: "Transportation", text: "Use a bicycle or walk for short-distance trips under 3 km.", carbon_saving: Math.round(co2_transport * 0.15 * 10) / 10, cost_saving: 10, difficulty: "Easy" });
      } else {
        recs.push({ category: "Transportation", text: "Integrate biking or walking into the first/last mile of your transit commute.", carbon_saving: Math.round(co2_transport * 0.1 * 10) / 10, cost_saving: 5, difficulty: "Easy" });
      }
    } else {
      recs.push({ category: "Transportation", text: "Maintain your low-impact transport habits! Walk or bike whenever possible.", carbon_saving: 5, cost_saving: 0, difficulty: "Easy" });
    }

    // Electricity
    if (co2_electricity > 40) {
      recs.push({ category: "Electricity", text: "Replace incandescent bulbs with LEDs and use smart power strips to eliminate standby power.", carbon_saving: Math.round(co2_electricity * 0.15 * 10) / 10, cost_saving: 12, difficulty: "Easy" });
      recs.push({ category: "Electricity", text: "Set thermostat 2°C higher in summer and lower in winter for 10-15% energy savings.", carbon_saving: Math.round(co2_electricity * 0.12 * 10) / 10, cost_saving: 15, difficulty: "Easy" });
      recs.push({ category: "Electricity", text: "Transition to clean energy via solar panels or a green utility program.", carbon_saving: Math.round(co2_electricity * 0.85 * 10) / 10, cost_saving: 50, difficulty: "Hard" });
    } else {
      recs.push({ category: "Electricity", text: "Unplug electronics when not in use to eliminate standby power emissions.", carbon_saving: 3, cost_saving: 4, difficulty: "Easy" });
    }

    // Food
    if (["meat_heavy", "meat_medium"].includes(food_preference)) {
      const veg_saving = food_preference === "meat_heavy" ? 80 : 40;
      const vegan_saving = food_preference === "meat_heavy" ? 140 : 90;
      recs.push({ category: "Food", text: "Switch to vegetarian meals 3 days a week. Focus on local, seasonal produce.", carbon_saving: veg_saving, cost_saving: 25, difficulty: "Easy" });
      recs.push({ category: "Food", text: "Adopt a plant-based (vegan) diet to maximize environmental benefits.", carbon_saving: vegan_saving, cost_saving: 40, difficulty: "Medium" });
    } else if (food_preference === "vegetarian") {
      recs.push({ category: "Food", text: "Replace dairy products with plant-based alternatives like oat milk.", carbon_saving: 30, cost_saving: 10, difficulty: "Easy" });
    } else {
      recs.push({ category: "Food", text: "Amazing job with a plant-based diet! Reduce food waste by meal planning.", carbon_saving: 10, cost_saving: 15, difficulty: "Easy" });
    }

    // Shopping
    if (shopping_freq === "high") {
      recs.push({ category: "Shopping", text: "Try a 'low-buy' month — restrict purchases to essential food and medicine only.", carbon_saving: 50, cost_saving: 120, difficulty: "Medium" });
      recs.push({ category: "Shopping", text: "Source secondhand clothing or rent apparel for special occasions.", carbon_saving: 35, cost_saving: 60, difficulty: "Easy" });
    } else if (shopping_freq === "medium") {
      recs.push({ category: "Shopping", text: "Adopt the '30-day rule': wait 30 days before buying non-essential items.", carbon_saving: 20, cost_saving: 45, difficulty: "Easy" });
    } else {
      recs.push({ category: "Shopping", text: "Support ethical and carbon-neutral brands when making essential purchases.", carbon_saving: 5, cost_saving: 0, difficulty: "Easy" });
    }

    // Sort by carbon saving desc
    recs.sort((a, b) => b.carbon_saving - a.carbon_saving);

    return { statusCode: 200, headers, body: JSON.stringify(recs) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ detail: e.message }) };
  }
};
