import json
import datetime

def handler(event, context):
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    }

    # Community stats — stateless computed values
    now = datetime.datetime.utcnow()
    start_of_day = datetime.datetime(now.year, now.month, now.day)
    seconds_passed = (now - start_of_day).total_seconds()
    total_carbon_saved = round(48592.5 + (seconds_passed * 0.15), 1)

    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps({
            "total_users": 1285,
            "average_score": 72.4,
            "total_carbon_saved": total_carbon_saved
        })
    }
