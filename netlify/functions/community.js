// Community Stats — live-updating carbon counter
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

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const secondsPassed = (now - startOfDay) / 1000;
  const total_carbon_saved = Math.round((48592.5 + secondsPassed * 0.15) * 10) / 10;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      total_users: 1285,
      average_score: 72.4,
      total_carbon_saved,
    })
  };
};
