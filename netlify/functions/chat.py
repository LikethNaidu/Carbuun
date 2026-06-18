import json

def handler(event, context):
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": ""}

    if event.get("httpMethod") != "POST":
        return {"statusCode": 405, "headers": headers, "body": json.dumps({"detail": "Method not allowed"})}

    try:
        body = json.loads(event.get("body", "{}"))
        msg = body.get("message", "").lower()

        # Get user context from the request body
        co2_transport = float(body.get("co2_transport", 150.0))
        co2_electricity = float(body.get("co2_electricity", 80.0))
        co2_food = float(body.get("co2_food", 180.0))
        co2_shopping = float(body.get("co2_shopping", 75.0))
        co2_total = co2_transport + co2_electricity + co2_food + co2_shopping
        transport_mode = str(body.get("transport_mode", "car_petrol"))
        food_preference = str(body.get("food_preference", "meat_medium"))
        travel_dist = float(body.get("travel_dist", 20.0))
        score = float(body.get("sustainability_score", 50.0))

        insights = []

        if any(x in msg for x in ["hello", "hi", "hey", "greet"]):
            reply = f"Hello! I'm GreenGuide AI, your sustainability coach. Your current score is **{score}/100**. "
            if score > 75:
                reply += "You're doing fantastic! Let's explore how to push closer to Climate Hero status."
            elif score > 50:
                reply += "You're on the right track! There are moderate adjustments we can make to lower your footprint."
            else:
                reply += "We have work to do, but every small change counts! Let's target your highest emission categories first."
            insights.append(f"Sustainability Score: {score}")

        elif any(x in msg for x in ["travel", "transport", "car", "drive", "commut"]):
            if transport_mode in ["car_petrol", "car_diesel"] and travel_dist > 15:
                reply = (f"You commute **{travel_dist} km/day** by {transport_mode.replace('_', ' ')}, generating **{co2_transport:.1f} kg CO₂/month** — your largest footprint component. "
                        f"Switching to public transport twice a week could save ~**{co2_transport * 0.28:.1f} kg CO₂/month**.")
                insights.append("High transport emissions — action recommended.")
            else:
                reply = (f"Your transport emissions are already low at **{co2_transport:.1f} kg CO₂/month**. "
                        f"You use {transport_mode.replace('_', ' ')} — excellent! Focus your efforts on food or energy instead.")
                insights.append("Low transport emissions. Consider energy or diet improvements.")

        elif any(x in msg for x in ["electric", "energy", "power", "bill", "light"]):
            if co2_electricity > 70:
                reply = (f"Your electricity footprint is **{co2_electricity:.1f} kg CO₂/month**. "
                        "Start with LED bulbs, smart power strips to cut standby power, and thermostat optimization (2°C adjustment saves up to 15%).")
                insights.append("High energy emissions detected.")
            else:
                reply = (f"Your electricity emissions are a modest **{co2_electricity:.1f} kg CO₂/month**. "
                        "To reduce further, check 'phantom loads' and ask your utility provider about 100% renewable plans.")
                insights.append("Electricity within moderate range.")

        elif any(x in msg for x in ["food", "diet", "meat", "eat", "vegan", "vegetarian"]):
            if food_preference in ["meat_heavy", "meat_medium"]:
                saving = 80.0 if food_preference == "meat_heavy" else 40.0
                reply = (f"Your food footprint is **{co2_food:.1f} kg CO₂/month** from your meat-inclusive diet. "
                        f"Switching to vegetarian meals 3 days/week saves ~**{saving:.0f} kg CO₂/month** — and often saves money too!")
                insights.append("Diet change has high impact potential.")
            else:
                reply = (f"Excellent! Your plant-based diet keeps food emissions at just **{co2_food:.1f} kg CO₂/month**. "
                        "To optimize further, reduce food waste through meal planning and freezing leftovers.")
                insights.append("Plant-based diet is highly optimal.")

        elif any(x in msg for x in ["budget", "limit", "allowance"]):
            total_budget = 400.0  # default budget sum
            if co2_total > total_budget:
                reply = (f"You are currently **over your carbon budget** with **{co2_total:.1f} kg CO₂/month** vs a suggested limit of {total_budget:.0f} kg. "
                        "Focus on your highest emission category to bring yourself back in budget.")
                insights.append("Over budget — action recommended.")
            else:
                reply = (f"You are within budget! Your monthly footprint of **{co2_total:.1f} kg** is below the suggested limit of **{total_budget:.0f} kg**. Keep it up!")
                insights.append("Within carbon budget.")

        else:
            max_cat = max([("Transportation", co2_transport), ("Electricity", co2_electricity),
                           ("Food", co2_food), ("Shopping", co2_shopping)], key=lambda x: x[1])
            reply = (f"Your total footprint is **{co2_total:.1f} kg CO₂/month**. "
                    f"Your highest emission category is **{max_cat[0]}** at {max_cat[1]:.1f} kg. "
                    "Ask me about 'travel advice', 'energy tips', or 'diet adjustments' for targeted coaching!")
            insights.append(f"Highest emission: {max_cat[0]}")

        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps({"reply": reply, "insights": insights})
        }
    except Exception as e:
        return {"statusCode": 500, "headers": headers, "body": json.dumps({"detail": str(e)})}
