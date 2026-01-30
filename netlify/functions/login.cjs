const FLOW_BASE_URL = process.env.FLOW_BASE_URL || "https://flow.eraenterprise.id";
const FLOW_API_KEY = process.env.FLOW_API_KEY || "";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(), body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders(), body: "Method Not Allowed" };
  }

  let payload = {};
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ ok: false, message: "Body harus JSON" }) };
  }

  try {
    const upstream = await fetch(`${FLOW_BASE_URL}/webhook/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(FLOW_API_KEY ? { "X-API-Key": FLOW_API_KEY } : {}),
      },
      body: JSON.stringify(payload),
    });

    const bodyText = await upstream.text();
    return {
      statusCode: upstream.status,
      headers: { ...corsHeaders(), "Content-Type": upstream.headers.get("content-type") || "application/json" },
      body: bodyText,
    };
  } catch (e) {
    return {
      statusCode: 502,
      headers: corsHeaders(),
      body: JSON.stringify({ ok: false, message: "Gateway error ke flow", detail: String(e?.message || e) }),
    };
  }
};
