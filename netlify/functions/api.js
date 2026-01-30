// netlify/functions/api.js
// Single handler: /api/health, /api/auth/login, /api/auth/signup
// Robust parsing: JSON, double-encoded JSON, single-quoted JSON, form-urlencoded, raw fallback
// No 400 just because body can't be parsed (it will forward raw)

const VERSION = "api-v8-2026-01-30";

const DEFAULT_FLOW_BASE_URL = "https://flow.eraenterprise.id";
const TIMEOUT_MS = 15000;

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  };
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

// sanitasi: trim + buang quote pembungkus '...' atau "..."
function sanitizeRaw(raw) {
  let s = (raw || "").trim();

  // buang BOM
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1);

  // jika body kebungkus single quotes (sering terjadi di windows/cmd)
  if (s.length >= 2 && s.startsWith("'") && s.endsWith("'")) {
    s = s.slice(1, -1).trim();
  }

  return s;
}

// parse robust -> object, kalau gagal -> { rawBody: ... }
function parsePayload(event) {
  const raw0 = getRawBody(event);
  const raw = sanitizeRaw(raw0);

  if (!raw) return { payload: {}, parsedAs: "empty" };

  // 1) JSON normal
  const j1 = safeJsonParse(raw);
  if (j1.ok) {
    // 2) kalau ternyata hasilnya string JSON (double-encoded), parse lagi
    if (typeof j1.value === "string") {
      const j2 = safeJsonParse(j1.value);
      if (j2.ok) return { payload: j2.value ?? {}, parsedAs: "json-double" };
      return { payload: { rawBody: raw0 }, parsedAs: "raw", parseError: j2.error };
    }
    return { payload: j1.value ?? {}, parsedAs: "json" };
  }

  // 3) form-urlencoded
  const f = parseFormUrlEncoded(raw);
  if (f.ok && Object.keys(f.value || {}).length > 0) {
    return { payload: f.value, parsedAs: "form-urlencoded" };
  }

  // 4) fallback raw (JANGAN 400)
  return { payload: { rawBody: raw0 }, parsedAs: "raw", parseError: j1.error };
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(t);
  }
}

async function proxyToFlow(event, flowPath) {
  const FLOW_BASE_URL = (process.env.FLOW_BASE_URL || DEFAULT_FLOW_BASE_URL).trim();
  const FLOW_API_KEY = (process.env.FLOW_API_KEY || "").trim();

  const { payload, parsedAs, parseError } = parsePayload(event);
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
        version: VERSION,
        message: "Gateway error ke flow",
        detail: msg,
        meta: {
          upstreamUrl,
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
  const method = event.httpMethod || "GET";
  const path = normalizePath(event);

  // CORS preflight
  if (method === "OPTIONS") return { statusCode: 204, headers, body: "" };

  // Health
  if (method === "GET" && path === "/health") {
    const debug = event?.queryStringParameters?.debug === "1";
    return {
      statusCode: 200,
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        ok: true,
        version: VERSION,
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
      body: JSON.stringify({ ok: false, version: VERSION, message: `Method ${method} not allowed` }),
    };
  }

  // Auth endpoints
  if (path === "/auth/login") return proxyToFlow(event, "/webhook/api/auth/login");
  if (path === "/auth/signup") return proxyToFlow(event, "/webhook/api/auth/signup");

  return {
    statusCode: 404,
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ ok: false, version: VERSION, message: "Not Found", path, method }),
  };
};
