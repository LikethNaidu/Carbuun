from fastapi import APIRouter, Response
from backend.app.schemas import schemas

router = APIRouter(prefix="/api", tags=["shopping"])

@router.post("/shopping", response_model=schemas.ShoppingAdviceResponse)
def api_shopping(payload: schemas.ShoppingAdviceRequest, response: Response):
    response.headers["Cache-Control"] = "public, max-age=3600"
    cat = payload.category.lower().strip()
    
    if "shoe" in cat:
        return schemas.ShoppingAdviceResponse(
            category="Shoes",
            estimated_impact="High. Traditional leather and synthetic sneakers generate substantial carbon footprint during manufacturing and supply chain transit.",
            co2_estimate=14.5,
            explanation="Standard running shoes require energy-intensive synthetic polymers, petroleum-based glues, and overseas air/freight logistics.",
            alternatives=[
                {"name": "Allbirds Wool Runners", "co2": 9.9, "desc": "Made from renewable Merino wool and sugarcane-based SweetFoam soles. Climate neutral.", "better_because": "Renewable natural fibers instead of synthetic plastics."},
                {"name": "Veja Organic Canvas Sneaker", "co2": 8.0, "desc": "Features wild Amazonian rubber and organic cotton canvas.", "better_because": "Sourced from agro-ecological farms, fair trade rubber."}
            ]
        )
    elif "clothing" in cat or "apparel" in cat or "shirt" in cat or "jeans" in cat:
        return schemas.ShoppingAdviceResponse(
            category="Clothing",
            estimated_impact="Medium to High. Fast fashion relies on synthetic fibers (polyester) and excessive pesticide water-use (conventional cotton).",
            co2_estimate=8.2,
            explanation="Polyester is a form of plastic derived from petroleum. Washing it also releases microplastics into marine ecosystems.",
            alternatives=[
                {"name": "Organic Cotton T-Shirt", "co2": 3.1, "desc": "Uses non-GMO seeds and 90% less water than traditional cotton.", "better_because": "Eliminates toxic fertilizers and reduces farming energy output."},
                {"name": "Recycled Polyester Windbreaker", "co2": 4.5, "desc": "Repurposes ocean-bound plastic bottles into durable outdoor clothing.", "better_because": "Requires 59% less energy to produce than virgin polyester."}
            ]
        )
    elif "electronic" in cat or "phone" in cat or "laptop" in cat or "device" in cat:
        return schemas.ShoppingAdviceResponse(
            category="Electronics",
            estimated_impact="Extremely High. Rare earth mineral mining, battery smelting, and precision manufacturing make electronics massive carbon emitters.",
            co2_estimate=80.0,
            explanation="Over 80% of a smartphone's lifetime emissions occur during manufacturing and extraction of cobalt, gold, and lithium.",
            alternatives=[
                {"name": "Fairphone 5", "co2": 35.0, "desc": "Designed with highly modular parts for easy home-repair. Fairtrade gold and recycled plastics.", "better_because": "Modular repairability extends product life, slashing manufacturing replacement cycle."},
                {"name": "Refurbished Premium Laptop", "co2": 15.0, "desc": "Pre-owned laptop fully restored to factory specs. Prevents e-waste.", "better_because": "Displaces emissions of a new factory build by extending existing hardware utility."}
            ]
        )
    else:
        return schemas.ShoppingAdviceResponse(
            category=payload.category,
            estimated_impact="Medium. Standard products consume raw resources and shipping fuels.",
            co2_estimate=20.0,
            explanation="General manufacturing relies heavily on industrial grids powered by fossil fuels.",
            alternatives=[
                {"name": "Locally-sourced Alternative", "co2": 5.0, "desc": "Item manufactured within 100 miles using local materials.", "better_because": "Eliminates global shipping cargo emissions."},
                {"name": "Secondhand/Used Option", "co2": 0.5, "desc": "Purchased from a local thrift store or online resale portal.", "better_because": "Zero manufacturing carbon footprint, diverts items from landfills."}
            ]
        )
