// Impact Simulator — mirrors backend simulation logic
exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ detail: "Method not allowed" }) };

  try {
    const body = JSON.parse(event.body || "{}");
    const co2_transport = parseFloat(body.co2_transport) || 132;
    const co2_electricity = parseFloat(body.co2_electricity) || 30;
    const co2_food = parseFloat(body.co2_food) || 180;
    const co2_shopping = parseFloat(body.co2_shopping) || 75;
    const transport_mode = body.transport_mode || "car_petrol";
    const food_preference = body.food_preference || "meat_medium";
    const travel_dist = parseFloat(body.travel_dist) || 20;
    const electricity_bill = parseFloat(body.electricity_bill) || 100;
    const household_size = Math.max(1, parseInt(body.household_size) || 2);
    const public_transport_days = parseFloat(body.public_transport_days) || 0;
    const electricity_reduction_pct = parseFloat(body.electricity_reduction_pct) || 0;
    const vegetarian_days = parseFloat(body.vegetarian_days) || 0;

    const original_co2 = co2_transport + co2_electricity + co2_food + co2_shopping;

    let sim_co2_transport = co2_transport;
    let sim_co2_electricity = co2_electricity;
    let sim_co2_food = co2_food;
    let cost_savings = 0;

    if (public_transport_days > 0 && ["car_petrol", "car_diesel"].includes(transport_mode)) {
      const car_factor = transport_mode === "car_petrol" ? 0.22 : 0.19;
      const pt_factor = 0.08;
      const savings_per_day = (travel_dist * car_factor - travel_dist * pt_factor) * 4.3;
      sim_co2_transport = Math.max(0, co2_transport - savings_per_day * public_transport_days);
      cost_savings += (travel_dist * 0.15 - 3) * public_transport_days * 4.3;
    }

    if (electricity_reduction_pct > 0) {
      const reduction = co2_electricity * (electricity_reduction_pct / 100);
      sim_co2_electricity = Math.max(0, co2_electricity - reduction);
      cost_savings += (electricity_bill / household_size) * (electricity_reduction_pct / 100);
    }

    if (vegetarian_days > 0 && ["meat_heavy", "meat_medium"].includes(food_preference)) {
      const saving_per_meal = food_preference === "meat_heavy" ? 7.1 : 3.8;
      sim_co2_food = Math.max(60, co2_food - saving_per_meal * vegetarian_days * 4.3);
      cost_savings += 2.5 * vegetarian_days * 4.3;
    }

    const new_co2 = sim_co2_transport + sim_co2_electricity + sim_co2_food + co2_shopping;
    const reduction_pct = Math.round(((original_co2 - new_co2) / Math.max(1, original_co2)) * 100 * 10) / 10;
    const annual_saving_co2 = Math.round((original_co2 - new_co2) * 12 * 100) / 100;
    const annual_saving_cost = Math.round(Math.max(0, cost_savings) * 12 * 100) / 100;

    return {
      statusCode: 200, headers,
      body: JSON.stringify({
        original_co2: Math.round(original_co2 * 100) / 100,
        new_co2: Math.round(new_co2 * 100) / 100,
        reduction_pct, annual_saving_co2, annual_saving_cost,
      })
    };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ detail: e.message }) };
  }
};
