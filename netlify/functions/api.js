// netlify/functions/api.js
// Pure Netlify Function handler (tanpa express)

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  };

  // Preflight CORS
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  // Normalisasi path (support /api/* dan /.netlify/functions/api/*)
  const rawPath = event.path || "/";
  let path = rawPath;

  const fnPrefix = "/.netlify/functions/api";
  if (path.startsWith(fnPrefix)) path = path.slice(fnPrefix.length);

  // Kadang ada kasus path masih kebawa "/api"
  if (path.startsWith("/api/")) path = path.slice(4);
  if (path === "/api") path = "/";

  if (!path.startsWith("/")) path = "/" + path;

  // Health endpoint
  if (event.httpMethod === "GET" && path === "/health") {
    return {
      statusCode: 200,
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        ok: true,
        service: "api",
        time: new Date().toISOString(),
        flow_base_set: Boolean(process.env.FLOW_BASE_URL),
        flow_key_set: Boolean(process.env.FLOW_API_KEY),
      }),
    };
  }

  const FLOW_BASE_URL = process.env.FLOW_BASE_URL || "https://flow.eraenterprise.id";
  const FLOW_API_KEY = process.env.FLOW_API_KEY || "";

  const readJsonBody = () => {
    if (!event.body) return {};
    try {
      const bodyStr = event.isBase64Encoded
        ? Buffer.from(event.body, "base64").toString("utf-8")
        : event.body;
      return JSON.parse(bodyStr || "{}");
    } catch {
      return null;
    }
  };

  const proxyToFlow = async (flowPath) => {
    const payload = readJsonBody();
    if (payload === null) {
      return {
        statusCode: 400,
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, message: "Body harus JSON valid" }),
      };
    }

    try {
      const upstream = await fetch(`${FLOW_BASE_URL}${flowPath}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(FLOW_API_KEY ? { "X-API-Key": FLOW_API_KEY } : {}),
        },
        body: JSON.stringify(payload),
      });

      const text = await upstream.text();
      return {
        statusCode: upstream.status,
        headers: {
          ...headers,
          "Content-Type": upstream.headers.get("content-type") || "application/json",
        },
        body: text,
      };
    } catch (e) {
      return {
        statusCode: 502,
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          ok: false,
          message: "Gateway error ke flow",
          detail: String(e?.message || e),
        }),
      };
    }
  };

  // Implementasi API (sesuai tugas kamu)
  if (event.httpMethod === "POST" && path === "/auth/login") {
    return proxyToFlow("/webhook/api/auth/login");
  }

  if (event.httpMethod === "POST" && path === "/auth/signup") {
    return proxyToFlow("/webhook/api/auth/signup");
  }

  return {
    statusCode: 404,
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ ok: false, message: "Not Found", path, method: event.httpMethod }),
  };
};
