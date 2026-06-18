import json
from app.services.calculator import calculate_footprint

def handler(event, context):
    if event.get("httpMethod") != "POST":
        return {"statusCode": 405, "body": json.dumps({"detail": "Method not allowed"})}

    try:
        body = json.loads(event.get("body", "{}"))

        travel_dist = float(body.get("travel_dist", 0))
        transport_mode = str(body.get("transport_mode", "car_petrol")).strip()
        electricity_bill = float(body.get("electricity_bill", 0))
        food_preference = str(body.get("food_preference", "meat_medium")).strip()
        shopping_freq = str(body.get("shopping_freq", "medium")).strip()
        household_size = int(body.get("household_size", 1))

        # Validate inputs
        if travel_dist < 0 or electricity_bill < 0 or household_size < 1:
            return {"statusCode": 422, "body": json.dumps({"detail": "Invalid input values"})}

        result = calculate_footprint(
            travel_dist=travel_dist,
            transport_mode=transport_mode,
            electricity_bill=electricity_bill,
            food_preference=food_preference,
            shopping_freq=shopping_freq,
            household_size=household_size
        )

        import datetime
        response = {
            "id": 1,
            "user_id": "default_user",
            "travel_dist": travel_dist,
            "transport_mode": transport_mode,
            "electricity_bill": electricity_bill,
            "food_preference": food_preference,
            "shopping_freq": shopping_freq,
            "household_size": household_size,
            **result,
            "created_at": datetime.datetime.utcnow().isoformat()
        }

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            "body": json.dumps(response)
        }
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"detail": str(e)})}
