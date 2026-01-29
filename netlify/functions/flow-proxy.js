// netlify/functions/flow-proxy.js

const DEFAULT_N8N_WEBHOOK_URL =
  "https://flow.eraenterprise.id/webhook/eramed-clara-appsmith";

// Helper: build common headers (CORS + JSON)
function baseHeaders(extra = {}) {
  return {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "Content-Type, Authorization",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    ...extra,
  };
}

// Helper: safely parse JSON
function safeJsonParse(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// Helper: decode body (handle base64)
function getRawBody(event) {
  if (!event?.body) return "";
  if (event.isBase64Encoded) {
    return Buffer.from(event.body, "base64").toString("utf8");
  }
  return event.body;
}

export const handler = async (event) => {
  const method = event.httpMethod || "GET";

  // 1) Preflight for CORS
  if (method === "OPTIONS") {
    return {
      statusCode: 204,
      headers: baseHeaders(),
      body: "",
    };
  }

  // 2) GET: simple health check + info (so browser won't show error)
  if (method === "GET") {
    const envUrl = (process.env.N8N_WEBHOOK_URL || "").trim();
    const chosenUrl = envUrl || DEFAULT_N8N_WEBHOOK_URL;

    // debug=1 will show which URL is used (safe in your case)
    const debug = event.queryStringParameters?.debug === "1";

    return {
      statusCode: 200,
      headers: baseHeaders(),
      body: JSON.stringify({
        ok: true,
        message:
          "flow-proxy is running. Send a POST JSON to forward to n8n.",
        methodAccepted: ["POST"],
        debug: debug
          ? {
              envPresent: Boolean(envUrl),
              chosenUrl,
            }
          : undefined,
      }),
    };
  }

  // 3) Only allow POST for forwarding
  if (method !== "POST") {
    return {
      statusCode: 405,
      headers: baseHeaders(),
      body: JSON.stringify({
        ok: false,
        error: `Method ${method} not allowed. Use POST.`,
      }),
    };
  }

  // 4) Choose target URL (ENV or fallback)
  const envUrl = (process.env.N8N_WEBHOOK_URL || "").trim();
  const url = envUrl || DEFAULT_N8N_WEBHOOK_URL;

  // 5) Parse incoming JSON body (optional; allow empty body)
  const rawBody = getRawBody(event);
  let payload = {};

  if (rawBody) {
    const parsed = safeJsonParse(rawBody);
    if (!parsed.ok) {
      return {
        statusCode: 400,
        headers: baseHeaders(),
        body: JSON.stringify({
          ok: false,
          error: "Invalid JSON body",
          detail: parsed.error,
        }),
      };
    }
    payload = parsed.value ?? {};
  }

  // 6) Forward to n8n with timeout
  const controller = new AbortController();
  const timeoutMs = 12000;
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        source: "netlify",
        receivedAt: new Date().toISOString(),
        ...payload,
      }),
      signal: controller.signal,
    });

    const resText = await res.text();
    clearTimeout(t);

    // Try to preserve n8n response if it's JSON; otherwise return as text
    const maybeJson = safeJsonParse(resText);
    const bodyOut = maybeJson.ok
      ? maybeJson.value
      : { ok: res.ok, status: res.status, text: resText };

    return {
      statusCode: res.status,
      headers: baseHeaders(),
      body: JSON.stringify(bodyOut),
    };
  } catch (e) {
    clearTimeout(t);
    const msg =
      String(e)?.includes("AbortError")
        ? `Upstream timeout after ${timeoutMs}ms`
        : String(e);

    return {
      statusCode: 502,
      headers: baseHeaders(),
      body: JSON.stringify({
        ok: false,
        error: "Failed to call n8n",
        detail: msg,
        envPresent: Boolean(envUrl), // helps diagnose Netlify ENV issues
      }),
    };
  }
};
