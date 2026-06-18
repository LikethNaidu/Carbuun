// Shopping Advisor — eco-alternatives for product categories
exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || "";
  const allowedOrigins = [
    "https://elegant-parfait-4cc2a7.netlify.app",
    "http://localhost:5173",
    "http://localhost:3000"
  ];
  const allowOrigin = allowedOrigins.includes(origin) ? origin : "https://elegant-parfait-4cc2a7.netlify.app";

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
    const rawCat = String(body.category || "");
    const sanitizedCatName = rawCat.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const cat = sanitizedCatName.toLowerCase().trim();

    let result;
    if (cat.includes("shoe") || cat.includes("sneaker") || cat.includes("boot")) {
      result = {
        category: "Shoes",
        estimated_impact: "High. Traditional leather and synthetic sneakers generate substantial emissions during manufacturing.",
        co2_estimate: 14.5,
        explanation: "Standard running shoes require energy-intensive synthetic polymers, petroleum glues, and overseas shipping.",
        alternatives: [
          { name: "Allbirds Wool Runners", co2: 9.9, desc: "Made from renewable Merino wool and sugarcane SweetFoam soles.", better_because: "Renewable natural fibers, climate neutral certified." },
          { name: "Veja Organic Canvas Sneaker", co2: 8.0, desc: "Wild Amazonian rubber and organic cotton canvas.", better_because: "Sourced from agro-ecological farms, fair trade rubber." }
        ]
      };
    } else if (["cloth", "shirt", "jean", "apparel", "dress", "wear"].some(x => cat.includes(x))) {
      result = {
        category: "Clothing",
        estimated_impact: "Medium to High. Fast fashion relies on synthetic fibres and excessive water usage.",
        co2_estimate: 8.2,
        explanation: "Polyester is a plastic derived from petroleum. Washing releases microplastics into marine ecosystems.",
        alternatives: [
          { name: "Organic Cotton T-Shirt", co2: 3.1, desc: "Uses non-GMO seeds and 90% less water than traditional cotton.", better_because: "Eliminates toxic fertilizers." },
          { name: "Recycled Polyester Windbreaker", co2: 4.5, desc: "Repurposes ocean-bound plastic bottles.", better_because: "59% less energy than virgin polyester." }
        ]
      };
    } else if (["electron", "phone", "laptop", "device", "computer", "tablet"].some(x => cat.includes(x))) {
      result = {
        category: "Electronics",
        estimated_impact: "Extremely High. Rare earth mineral mining and precision manufacturing are massive carbon emitters.",
        co2_estimate: 80.0,
        explanation: "Over 80% of a smartphone's lifetime emissions occur during manufacturing.",
        alternatives: [
          { name: "Fairphone 5", co2: 35.0, desc: "Modular design for easy home-repair. Fairtrade gold and recycled plastics.", better_because: "Repairability extends product life." },
          { name: "Refurbished Laptop", co2: 15.0, desc: "Pre-owned laptop fully restored to factory specs.", better_because: "Displaces emissions of a new factory build entirely." }
        ]
      };
    } else if (["food", "groceri", "produce"].some(x => cat.includes(x))) {
      result = {
        category: "Food & Groceries",
        estimated_impact: "Medium. Highly dependent on sourcing, seasonality, and transport.",
        co2_estimate: 5.0,
        explanation: "Imported out-of-season produce is often transported by air freight — the highest carbon transport mode.",
        alternatives: [
          { name: "Local Farmers Market Produce", co2: 0.5, desc: "Seasonal vegetables sourced within 50km of your home.", better_because: "Zero air freight, supports local biodiversity." },
          { name: "Community Supported Agriculture (CSA) Box", co2: 0.7, desc: "Weekly box from a certified organic farm.", better_because: "Minimal packaging, zero supply chain complexity." }
        ]
      };
    } else {
      result = {
        category: sanitizedCatName || "Product",
        estimated_impact: "Medium. Standard products consume raw resources and shipping fuels.",
        co2_estimate: 20.0,
        explanation: "General manufacturing relies heavily on fossil fuel grids.",
        alternatives: [
          { name: "Locally-sourced Alternative", co2: 5.0, desc: "Item made within 100 miles using local materials.", better_because: "Eliminates global shipping emissions." },
          { name: "Secondhand / Used Option", co2: 0.5, desc: "Purchased from a local thrift store or resale portal.", better_because: "Zero manufacturing carbon, diverts from landfills." }
        ]
      };
    }

    return { statusCode: 200, headers, body: JSON.stringify(result) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ detail: e.message }) };
  }
};
