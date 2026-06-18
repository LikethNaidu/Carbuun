// Smart AI Chat — contextual sustainability coaching
exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || "";
  let allowOrigin = "https://elegant-parfait-4cc2a7.netlify.app";
  if (origin.includes("localhost") || origin.includes("127.0.0.1") || origin === "https://elegant-parfait-4cc2a7.netlify.app") {
    allowOrigin = origin;
  }

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
    const rawMsg = String(body.message || "");
    const sanitizedMsg = rawMsg.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const msg = sanitizedMsg.toLowerCase();
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
        const diffText = co2_transport > 120 ? "above the average commuter transport footprint of 120 kg CO₂" : "under the average commuter transport footprint of 120 kg CO₂";
        reply = `You commute **${travel_dist} km/day** by ${transport_mode.replace("_", " ")}, generating **${co2_transport.toFixed(1)} kg CO₂/month** — which is ${diffText}. Switching to public transport twice a week could save ~**${(co2_transport * 0.28).toFixed(1)} kg CO₂/month**.`;
        insights.push("High transport emissions — action recommended.");
      } else {
        reply = `Your transport emissions are already low at **${co2_transport.toFixed(1)} kg CO₂/month** (below the typical commuter average of 120 kg CO₂). You use ${transport_mode.replace("_", " ")} — excellent! Focus your efforts on food or energy instead.`;
        insights.push("Low transport emissions. Consider energy or diet improvements.");
      }

    } else if (["electric", "energy", "power", "bill", "light"].some(x => msg.includes(x))) {
      if (co2_electricity > 70) {
        reply = `Your electricity footprint is **${co2_electricity.toFixed(1)} kg CO₂/month** (compared to a typical low-carbon target of 40 kg CO₂/month). Start with LED bulbs, smart power strips to cut standby power, and thermostat optimization (2°C adjustment saves up to 15%).`;
        insights.push("High energy emissions detected.");
      } else {
        reply = `Your electricity emissions are a modest **${co2_electricity.toFixed(1)} kg CO₂/month** (well below the global average household share of 85 kg CO₂/month). To reduce further, check 'phantom loads' and ask your utility provider about 100% renewable plans.`;
        insights.push("Electricity within moderate range.");
      }

    } else if (["food", "diet", "meat", "eat", "vegan", "vegetarian"].some(x => msg.includes(x))) {
      if (["meat_heavy", "meat_medium"].includes(food_preference)) {
        const saving = food_preference === "meat_heavy" ? 80 : 40;
        reply = `Your food footprint is **${co2_food.toFixed(1)} kg CO₂/month** from your meat-inclusive diet. For comparison, a standard plant-based vegetarian diet is only 100 kg CO₂/month. Replaces meat meals with vegetarian options 3 days/week saves ~**${saving} kg CO₂/month** — and often saves money!`;
        insights.push("Diet change has high impact potential.");
      } else {
        reply = `Excellent! Your plant-based diet keeps food emissions at just **${co2_food.toFixed(1)} kg CO₂/month** (60% lower than an average meat-inclusive diet of 180 kg CO₂/month). To optimize further, reduce food waste through meal planning and freezing leftovers.`;
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

    } else if (["compare", "average", "global", "standard", "national", "benchmark"].some(x => msg.includes(x))) {
      const global_avg = 400.0;
      const us_avg = 1200.0;
      const eu_avg = 560.0;
      const target_limit = 160.0;
      
      const diff_global_pct = ((co2_total - global_avg) / global_avg) * 100;
      const diff_us_pct = ((co2_total - us_avg) / us_avg) * 100;
      const diff_eu_pct = ((co2_total - eu_avg) / eu_avg) * 100;
      const diff_target_pct = ((co2_total - target_limit) / target_limit) * 100;
      
      reply = `Here is how your monthly footprint of **${co2_total.toFixed(1)} kg CO₂** compares to global benchmarks:\n\n` +
              `1. **Global Average (${global_avg} kg)**: You are **${Math.abs(diff_global_pct).toFixed(1)}% ${diff_global_pct > 0 ? "above" : "below"}** the global average.\n` +
              `2. **US Average (${us_avg} kg)**: You are **${Math.abs(diff_us_pct).toFixed(1)}% ${diff_us_pct > 0 ? "above" : "below"}** the average citizen in the US.\n` +
              `3. **EU Average (${eu_avg} kg)**: You are **${Math.abs(diff_eu_pct).toFixed(1)}% ${diff_eu_pct > 0 ? "above" : "below"}** the average citizen in the EU.\n` +
              `4. **Sustainable Limit (${target_limit} kg)**: You are **${Math.abs(diff_target_pct).toFixed(1)}% ${diff_target_pct > 0 ? "above" : "below"}** the target sustainable limit required to limit global warming to 1.5°C.\n\n`;
              
      if (co2_total <= target_limit) {
        reply += "Outstanding! You are already living within the sustainable global carbon budget.";
      } else if (co2_total <= global_avg) {
        reply += "Good job! You are below the global average, but further action is needed to reach the 1.5°C sustainable target.";
      } else {
        reply += "Your emissions are higher than the global average. Let's focus on lowering transportation and diet emissions to make the biggest impact.";
      }
      
      insights.push(`Global Avg: ${global_avg} kg`);
      insights.push(`Sustainable Target: ${target_limit} kg`);

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
