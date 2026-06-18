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

        original_co2_transport = float(body.get("co2_transport", 132.0))
        original_co2_electricity = float(body.get("co2_electricity", 30.0))
        original_co2_food = float(body.get("co2_food", 180.0))
        original_co2_shopping = float(body.get("co2_shopping", 75.0))
        transport_mode = str(body.get("transport_mode", "car_petrol"))
        food_preference = str(body.get("food_preference", "meat_medium"))
        travel_dist = float(body.get("travel_dist", 20.0))
        electricity_bill = float(body.get("electricity_bill", 100.0))
        household_size = int(body.get("household_size", 2))

        public_transport_days = body.get("public_transport_days", 0)
        electricity_reduction_pct = body.get("electricity_reduction_pct", 0)
        vegetarian_days = body.get("vegetarian_days", 0)

        original_co2 = original_co2_transport + original_co2_electricity + original_co2_food + original_co2_shopping

        sim_co2_transport = original_co2_transport
        sim_co2_electricity = original_co2_electricity
        sim_co2_food = original_co2_food
        cost_savings = 0.0

        if public_transport_days and public_transport_days > 0:
            if transport_mode in ["car_petrol", "car_diesel"]:
                car_factor = 0.22 if transport_mode == "car_petrol" else 0.19
                pt_factor = 0.08
                original_daily = travel_dist * car_factor
                pt_daily = travel_dist * pt_factor
                savings_per_day = (original_daily - pt_daily) * 4.3
                sim_co2_transport = max(0.0, original_co2_transport - (savings_per_day * public_transport_days))
                cost_savings += (travel_dist * 0.15 - 3.0) * public_transport_days * 4.3

        if electricity_reduction_pct and electricity_reduction_pct > 0:
            reduction = original_co2_electricity * (electricity_reduction_pct / 100.0)
            sim_co2_electricity = max(0.0, original_co2_electricity - reduction)
            cost_savings += (electricity_bill / max(1, household_size)) * (electricity_reduction_pct / 100.0)

        if vegetarian_days and vegetarian_days > 0:
            if food_preference in ["meat_heavy", "meat_medium"]:
                saving_per_meal = 7.1 if food_preference == "meat_heavy" else 3.8
                sim_co2_food = max(60.0, original_co2_food - (saving_per_meal * vegetarian_days * 4.3))
                cost_savings += 2.5 * vegetarian_days * 4.3

        new_co2 = sim_co2_transport + sim_co2_electricity + sim_co2_food + original_co2_shopping
        reduction_pct = round(((original_co2 - new_co2) / max(1.0, original_co2)) * 100.0, 1)
        annual_saving_co2 = round((original_co2 - new_co2) * 12.0, 2)
        annual_saving_cost = round(max(0.0, cost_savings) * 12.0, 2)

        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps({
                "original_co2": round(original_co2, 2),
                "new_co2": round(new_co2, 2),
                "reduction_pct": reduction_pct,
                "annual_saving_co2": annual_saving_co2,
                "annual_saving_cost": annual_saving_cost
            })
        }
    except Exception as e:
        return {"statusCode": 500, "headers": headers, "body": json.dumps({"detail": str(e)})}
