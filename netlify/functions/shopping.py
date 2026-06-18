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
        cat = body.get("category", "").lower().strip()

        if "shoe" in cat:
            result = {
                "category": "Shoes",
                "estimated_impact": "High. Traditional leather and synthetic sneakers generate substantial emissions during manufacturing.",
                "co2_estimate": 14.5,
                "explanation": "Standard running shoes require energy-intensive synthetic polymers, petroleum glues, and overseas shipping.",
                "alternatives": [
                    {"name": "Allbirds Wool Runners", "co2": 9.9, "desc": "Made from renewable Merino wool and sugarcane SweetFoam soles.", "better_because": "Renewable natural fibers, climate neutral certified."},
                    {"name": "Veja Organic Canvas Sneaker", "co2": 8.0, "desc": "Wild Amazonian rubber and organic cotton canvas.", "better_because": "Sourced from agro-ecological farms, fair trade rubber."}
                ]
            }
        elif any(x in cat for x in ["cloth", "shirt", "jean", "apparel"]):
            result = {
                "category": "Clothing",
                "estimated_impact": "Medium to High. Fast fashion relies on synthetic fibres and excessive water usage.",
                "co2_estimate": 8.2,
                "explanation": "Polyester is a plastic derived from petroleum. Washing releases microplastics into marine ecosystems.",
                "alternatives": [
                    {"name": "Organic Cotton T-Shirt", "co2": 3.1, "desc": "Uses non-GMO seeds and 90% less water than traditional cotton.", "better_because": "Eliminates toxic fertilizers."},
                    {"name": "Recycled Polyester Windbreaker", "co2": 4.5, "desc": "Repurposes ocean-bound plastic bottles.", "better_because": "59% less energy to produce than virgin polyester."}
                ]
            }
        elif any(x in cat for x in ["electron", "phone", "laptop", "device"]):
            result = {
                "category": "Electronics",
                "estimated_impact": "Extremely High. Rare earth mineral mining and precision manufacturing are massive carbon emitters.",
                "co2_estimate": 80.0,
                "explanation": "Over 80% of a smartphone's lifetime emissions occur during manufacturing.",
                "alternatives": [
                    {"name": "Fairphone 5", "co2": 35.0, "desc": "Modular design for easy home-repair. Fairtrade gold and recycled plastics.", "better_because": "Repairability extends product life, slashing new manufacturing cycles."},
                    {"name": "Refurbished Laptop", "co2": 15.0, "desc": "Pre-owned laptop fully restored to factory specs.", "better_because": "Displaces emissions of a new factory build entirely."}
                ]
            }
        else:
            result = {
                "category": body.get("category", "Product"),
                "estimated_impact": "Medium. Standard products consume raw resources and shipping fuels.",
                "co2_estimate": 20.0,
                "explanation": "General manufacturing relies heavily on fossil fuel grids.",
                "alternatives": [
                    {"name": "Locally-sourced Alternative", "co2": 5.0, "desc": "Item made within 100 miles using local materials.", "better_because": "Eliminates global shipping emissions."},
                    {"name": "Secondhand/Used Option", "co2": 0.5, "desc": "Purchased from a local thrift store or resale portal.", "better_because": "Zero manufacturing carbon, diverts from landfills."}
                ]
            }

        return {"statusCode": 200, "headers": headers, "body": json.dumps(result)}
    except Exception as e:
        return {"statusCode": 500, "headers": headers, "body": json.dumps({"detail": str(e)})}
