import json
from app.services.recommendations import generate_recommendations

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

        co2_transport = float(body.get("co2_transport", 150.0))
        co2_electricity = float(body.get("co2_electricity", 80.0))
        co2_food = float(body.get("co2_food", 180.0))
        co2_shopping = float(body.get("co2_shopping", 75.0))
        food_preference = str(body.get("food_preference", "meat_medium"))
        transport_mode = str(body.get("transport_mode", "car_petrol"))
        shopping_freq = str(body.get("shopping_freq", "medium"))

        recs = generate_recommendations(
            co2_transport=co2_transport,
            co2_electricity=co2_electricity,
            co2_food=co2_food,
            co2_shopping=co2_shopping,
            food_preference=food_preference,
            transport_mode=transport_mode,
            shopping_freq=shopping_freq
        )

        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps([r.model_dump() for r in recs])
        }
    except Exception as e:
        return {"statusCode": 500, "headers": headers, "body": json.dumps({"detail": str(e)})}
