// Smart AI Chat — contextual sustainability coaching
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
    const msg = (body.message || "").toLowerCase();
    const co2_transport = parseFloat(body.co2_transport) || 150;
    const co2_electricity = parseFloat(body.co2_electricity) || 80;
    const co2_food = parseFloat(body.co2_food) || 180;
    const co2_shopping = parseFloat(body.co2_shopping) || 75;
    const co2_total = co2_transport + co2_electricity + co2_food + co2_shopping;
    const transport_mode = body.transport_mode || "car_petrol";
    const food_preference = body.food_preference || "meat_medium";
    const travel_dist = parseFloat(body.travel_dist) || 20;
    const electricity_bill = parseFloat(body.electricity_bill) || 100;
    const score = parseFloat(body.sustainability_score) || 50;

    const insights = [];
    let reply;

    if (["hello", "hi", "hey", "greet"].some(x => msg.includes(x))) {
      reply = `Hello! I'm GreenGuide AI, your personal sustainability coach. Your current score is **${score}/100**. `;
      if (score > 75) reply += "You're doing fantastic! Let's explore how to push closer to Climate Hero status.";
      else if (score > 50) reply += "You're on the right track! There are moderate adjustments we can make to lower your footprint.";
      else reply += "We have work to do, but every small change counts! Let's target your highest emission categories first.";
      insights.push(`Sustainability Score: ${score}`);

    } else if (["travel", "transport", "car", "drive", "commut", "bus", "train"].some(x => msg.includes(x))) {
      if (["car_petrol", "car_diesel"].includes(transport_mode) && travel_dist > 15) {
        reply = `You commute **${travel_dist} km/day** by ${transport_mode.replace("_", " ")}, generating **${co2_transport.toFixed(1)} kg CO₂/month** — your largest footprint component. Switching to public transport twice a week could save ~**${(co2_transport * 0.28).toFixed(1)} kg CO₂/month**.`;
        insights.push("High transport emissions — action recommended.");
      } else {
        reply = `Your transport emissions are already low at **${co2_transport.toFixed(1)} kg CO₂/month**. You use ${transport_mode.replace("_", " ")} — excellent! Focus your efforts on food or energy instead.`;
        insights.push("Low transport emissions. Consider energy or diet improvements.");
      }

    } else if (["electric", "energy", "power", "bill", "light"].some(x => msg.includes(x))) {
      if (co2_electricity > 70) {
        reply = `Your electricity footprint is **${co2_electricity.toFixed(1)} kg CO₂/month**. Start with LED bulbs, smart power strips to cut standby power, and thermostat optimization (2°C adjustment saves up to 15%).`;
        insights.push("High energy emissions detected.");
      } else {
        reply = `Your electricity emissions are a modest **${co2_electricity.toFixed(1)} kg CO₂/month**. To reduce further, check 'phantom loads' and ask your utility provider about 100% renewable plans.`;
        insights.push("Electricity within moderate range.");
      }

    } else if (["food", "diet", "meat", "eat", "vegan", "vegetarian"].some(x => msg.includes(x))) {
      if (["meat_heavy", "meat_medium"].includes(food_preference)) {
        const saving = food_preference === "meat_heavy" ? 80 : 40;
        reply = `Your food footprint is **${co2_food.toFixed(1)} kg CO₂/month** from your meat-inclusive diet. Switching to vegetarian meals 3 days/week saves ~**${saving} kg CO₂/month** — and often saves money too!`;
        insights.push("Diet change has high impact potential.");
      } else {
        reply = `Excellent! Your plant-based diet keeps food emissions at just **${co2_food.toFixed(1)} kg CO₂/month**. To optimize further, reduce food waste through meal planning and freezing leftovers.`;
        insights.push("Plant-based diet is highly optimal.");
      }

    } else if (["budget", "limit", "allowance", "target"].some(x => msg.includes(x))) {
      const total_budget = 400;
      if (co2_total > total_budget) {
        reply = `You are currently **over your carbon budget** with **${co2_total.toFixed(1)} kg CO₂/month** vs a suggested limit of ${total_budget} kg. Focus on your highest emission category to bring yourself back in budget.`;
        insights.push("Over budget — action recommended.");
      } else {
        reply = `You are within budget! Your monthly footprint of **${co2_total.toFixed(1)} kg** is below the suggested limit of **${total_budget} kg**. Keep it up!`;
        insights.push("Within carbon budget.");
      }

    } else if (["tip", "advice", "help", "suggest", "recommend"].some(x => msg.includes(x))) {
      const cats = [["Transportation", co2_transport], ["Electricity", co2_electricity], ["Food", co2_food], ["Shopping", co2_shopping]];
      const maxCat = cats.reduce((a, b) => b[1] > a[1] ? b : a);
      const tips = {
        Transportation: "Try cycling or public transport 2 days a week.",
        Electricity: "Unplug idle devices and switch to LED bulbs today.",
        Food: "Go meat-free on Mondays — it's the highest-impact single change you can make.",
        Shopping: "Before buying, check if the item exists secondhand."
      };
      reply = `Your top emission source is **${maxCat[0]}** at ${maxCat[1].toFixed(1)} kg CO₂/month. Quick win: ${tips[maxCat[0]]}`;
      insights.push(`Highest emission: ${maxCat[0]}`);

    } else {
      const cats = [["Transportation", co2_transport], ["Electricity", co2_electricity], ["Food", co2_food], ["Shopping", co2_shopping]];
      const maxCat = cats.reduce((a, b) => b[1] > a[1] ? b : a);
      reply = `Your total footprint is **${co2_total.toFixed(1)} kg CO₂/month**. Your highest emission category is **${maxCat[0]}** at ${maxCat[1].toFixed(1)} kg. Ask me about 'travel advice', 'energy tips', or 'diet adjustments' for targeted coaching!`;
      insights.push(`Highest emission: ${maxCat[0]}`);
    }

    return { statusCode: 200, headers, body: JSON.stringify({ reply, insights }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ detail: e.message }) };
  }
};
