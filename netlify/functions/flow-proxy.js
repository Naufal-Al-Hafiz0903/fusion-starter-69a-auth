// netlify/functions/flow-proxy.js (ESM)
const VERSION = "flow-proxy-auth-v2-2026-01-31";

const DEFAULT_FLOW_BASE_URL = "https://flow.eraenterprise.id";
const DEFAULT_WEBHOOK_PATH = "/webhook/eramed-clara-appsmith";

function cors(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key, X-Requested-With",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  };
}

function json(headers, statusCode, payload) {
  return {
    statusCode,
    headers: { ...headers, "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  };
}

function safeTrim(v) {
  return (typeof v === "string" ? v : "").trim();
}

function parseJsonBody(event) {
  if (!event?.body) return { ok: true, data: {} };

  try {
    const raw = event.isBase64Encoded
      ? Buffer.from(event.body, "base64").toString("utf8")
      : event.body;

    const ct = safeTrim(event?.headers?.["content-type"] || event?.headers?.["Content-Type"]);
    if (ct.includes("application/json")) {
      return { ok: true, data: JSON.parse(raw || "{}") };
    }

    // fallback: coba parse JSON walau content-type tidak tepat
    return { ok: true, data: JSON.parse(raw || "{}") };
  } catch (e) {
    return { ok: false, error: "Invalid JSON body" };
  }
}

async function fetchWithTimeout(url, options, ms = 15000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(t);
  }
}

export const handler = async (event) => {
  const origin = event?.headers?.origin || event?.headers?.Origin || "*";
  const method = event?.httpMethod || "GET";
  const headers = cors(origin);

  if (method === "OPTIONS") return { statusCode: 204, headers, body: "" };

  const FLOW_BASE_URL = safeTrim(process.env.FLOW_BASE_URL) || DEFAULT_FLOW_BASE_URL;
  const FLOW_WEBHOOK_PATH = safeTrim(process.env.FLOW_WEBHOOK_PATH) || DEFAULT_WEBHOOK_PATH;
  const FLOW_API_KEY = safeTrim(process.env.FLOW_API_KEY);

  if (method === "GET") {
    return json(headers, 200, {
      ok: true,
      version: VERSION,
      flowBase: FLOW_BASE_URL,
      webhookPath: FLOW_WEBHOOK_PATH,
      hasKey: Boolean(FLOW_API_KEY),
    });
  }

  if (method !== "POST") {
    return json(headers, 405, { ok: false, message: "Method not allowed" });
  }

  const parsed = parseJsonBody(event);
  if (!parsed.ok) return json(headers, 400, { ok: false, message: parsed.error });

  // payload dari frontend
  const body = parsed.data || {};
  // minimal: action + data
  // contoh: { action: "login", data: { email, password } }
  const action = safeTrim(body.action);
  const data = body.data ?? body; // fallback: kalau frontend langsung kirim {email,password}

  if (!action) {
    return json(headers, 400, { ok: false, message: "Missing `action` (login/signup/social)" });
  }

  const targetUrl = `${FLOW_BASE_URL}${FLOW_WEBHOOK_PATH}`;

  try {
    const upstreamHeaders = {
      "Content-Type": "application/json",
      ...(FLOW_API_KEY ? { "X-API-Key": FLOW_API_KEY } : {}),
    };

    const upstreamBody = {
      source: "netlify",
      version: VERSION,
      action,
      data,
      meta: {
        ip:
          event?.headers?.["x-forwarded-for"] ||
          event?.headers?.["client-ip"] ||
          null,
        ua: event?.headers?.["user-agent"] || null,
      },
    };

    const res = await fetchWithTimeout(
      targetUrl,
      {
        method: "POST",
        headers: upstreamHeaders,
        body: JSON.stringify(upstreamBody),
      },
      20000
    );

    const text = await res.text();
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { raw: text };
    }

    return json(headers, 200, {
      ok: res.ok,
      status: res.status,
      target: targetUrl,
      result: payload,
    });
  } catch (err) {
    return json(headers, 502, {
      ok: false,
      message: "Proxy failed to reach flow",
      error: String(err?.message || err),
    });
  }
};
