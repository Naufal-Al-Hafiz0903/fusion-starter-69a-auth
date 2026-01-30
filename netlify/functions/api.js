// netlify/functions/api.js
// Pure Netlify Function handler (tanpa express)
// Fitur:
// - GET /api/health
// - POST /api/auth/login  -> forward ke FLOW /webhook/api/auth/login
// - POST /api/auth/signup -> forward ke FLOW /webhook/api/auth/signup
// - Robust body parsing: JSON / form-urlencoded / raw string (tidak mudah gagal)
// - CORS + OPTIONS
// - Timeout upstream
// - Debug optional: GET /api/health?debug=1

const DEFAULT_FLOW_BASE_URL = "https://flow.eraenterprise.id";
const TIMEOUT_MS = 15000;

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  };
}

function getRawBody(event) {
  if (!event?.body) return "";
  if (event.isBase64Encoded) {
    return Buffer.from(event.body, "base64").toString("utf-8");
  }
  return event.body;
}

function safeJsonParse(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

function parseFormUrlEncoded(raw) {
  try {
    const params = new URLSearchParams(raw);
    const obj = {};
    for (const [k, v] of params.entries()) obj[k] = v;
    return { ok: true, value: obj };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

function normalizePath(event) {
  const rawPath = event?.path || "/";
  let path = rawPath;

  // support /.netlify/functions/api/*
  const fnPrefix = "/.netlify/functions/api";
  if (path.startsWith(fnPrefix)) path = path.slice(fnPrefix.length);

  // support /api/* (redirect)
  if (path.startsWith("/api/")) path = path.slice(4);
  if (path === "/api") path = "/";

  if (!path.startsWith("/")) path = "/" + path;
  return path;
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(t);
  }
}

async function proxyToFlow(event, flowPath) {
  const FLOW_BASE_URL = (process.env.FLOW_BASE_URL || DEFAULT_FLOW_BASE_URL).trim();
  const FLOW_API_KEY = (process.env.FLOW_API_KEY || "").trim();

  const rawBody = getRawBody(event);
  const contentType = (event?.headers?.["content-type"] || event?.headers?.["Content-Type"] || "")
    .split(";")[0]
    .trim()
    .toLowerCase();

  // Robust parse (tidak gampang error)
  let payload = {};
  let parsedAs = "empty";
  let parseError = null;

  if (rawBody) {
    const j = safeJsonParse(rawBody);
    if (j.ok) {
      payload = j.value ?? {};
      parsedAs = "json";
    } else {
      const f = parseFormUrlEncoded(rawBody);
      if (f.ok && Object.keys(f.value || {}).length > 0) {
        payload = f.value;
        parsedAs = "form-urlencoded";
      } else {
        // terakhir: kirim raw
        payload = { rawBody };
        parsedAs = "raw";
        parseError = j.error;
      }
    }
  }

  const upstreamUrl = `${FLOW_BASE_URL}${flowPath}`;

  try {
    const upstream = await fetchWithTimeout(
      upstreamUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(FLOW_API_KEY ? { "X-API-Key": FLOW_API_KEY } : {}),
        },
        body: JSON.stringify(payload),
      },
      TIMEOUT_MS
    );

    const bodyText = await upstream.text();
    return {
      statusCode: upstream.status,
      headers: { ...corsHeaders(), "Content-Type": upstream.headers.get("content-type") || "application/json" },
      body: bodyText,
    };
  } catch (e) {
    const msg =
      String(e)?.includes("AbortError") ? `Upstream timeout after ${TIMEOUT_MS}ms` : String(e?.message || e);

    return {
      statusCode: 502,
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({
        ok: false,
        message: "Gateway error ke flow",
        detail: msg,
        meta: {
          upstreamUrl,
          contentType: contentType || null,
          parsedAs,
          ...(parseError ? { parseError } : {}),
          flow_base_set: Boolean(process.env.FLOW_BASE_URL),
          flow_key_set: Boolean(process.env.FLOW_API_KEY),
        },
      }),
    };
  }
}

exports.handler = async (event) => {
  const headers = corsHeaders();

  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  const path = normalizePath(event);
  const method = event.httpMethod || "GET";

  // Health endpoint
  if (method === "GET" && path === "/health") {
    const debug = event?.queryStringParameters?.debug === "1";
    return {
      statusCode: 200,
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        ok: true,
        service: "api",
        time: new Date().toISOString(),
        flow_base_set: Boolean(process.env.FLOW_BASE_URL),
        flow_key_set: Boolean(process.env.FLOW_API_KEY),
        ...(debug
          ? {
              debug: {
                flowBase: (process.env.FLOW_BASE_URL || DEFAULT_FLOW_BASE_URL).trim(),
                hasKey: Boolean((process.env.FLOW_API_KEY || "").trim()),
              },
            }
          : {}),
      }),
    };
  }

  // Only POST for auth
  if (method !== "POST") {
    return {
      statusCode: 405,
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, message: `Method ${method} not allowed` }),
    };
  }

  // Auth routes (sesuai tugas kamu)
  if (path === "/auth/login") {
    return proxyToFlow(event, "/webhook/api/auth/login");
  }

  if (path === "/auth/signup") {
    return proxyToFlow(event, "/webhook/api/auth/signup");
  }

  return {
    statusCode: 404,
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ ok: false, message: "Not Found", path, method }),
  };
};
