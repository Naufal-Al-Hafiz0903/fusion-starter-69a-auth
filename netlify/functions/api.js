// netlify/functions/api.js (ESM)
// Gateway: Appsmith -> Netlify -> n8n webhook (login & signup)

const VERSION = "api-gateway-n8n-v2-2026-01-31";
const DEFAULT_FLOW_BASE_URL = "https://flow.eraenterprise.id";
const TIMEOUT_MS = 15000;

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  };
}

function normalizePath(event) {
  const rawPath = event?.path || "/";
  let path = rawPath;

  const fnPrefix = "/.netlify/functions/api";
  if (path.startsWith(fnPrefix)) path = path.slice(fnPrefix.length);

  if (path.startsWith("/api/")) path = path.slice(4);
  if (path === "/api") path = "/";

  if (!path.startsWith("/")) path = "/" + path;
  return path;
}

function getRawBody(event) {
  if (!event?.body) return "";
  if (event.isBase64Encoded) return Buffer.from(event.body, "base64").toString("utf-8");
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

function sanitizeRaw(raw) {
  let s = (raw || "").trim();
  if (s && s.charCodeAt(0) === 0xfeff) s = s.slice(1); // BOM
  if (s.length >= 2 && s.startsWith("'") && s.endsWith("'")) s = s.slice(1, -1).trim();
  return s;
}

function parsePayload(event) {
  const raw0 = getRawBody(event);
  const raw = sanitizeRaw(raw0);

  if (!raw) return { payload: {}, parsedAs: "empty" };

  const j1 = safeJsonParse(raw);
  if (j1.ok) {
    if (typeof j1.value === "string") {
      const j2 = safeJsonParse(j1.value);
      if (j2.ok) return { payload: j2.value ?? {}, parsedAs: "json-double" };
      return { payload: { rawBody: raw0 }, parsedAs: "raw", parseError: j2.error };
    }
    return { payload: j1.value ?? {}, parsedAs: "json" };
  }

  const f = parseFormUrlEncoded(raw);
  if (f.ok && Object.keys(f.value || {}).length > 0) {
    return { payload: f.value, parsedAs: "form-urlencoded" };
  }

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

function json(statusCode, origin, obj, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json; charset=utf-8",
      "x-api-version": VERSION,
      ...extraHeaders,
    },
    body: JSON.stringify(obj),
  };
}

async function proxyToN8n(event, origin, flowPath) {
  const FLOW_BASE_URL = (process.env.FLOW_BASE_URL || DEFAULT_FLOW_BASE_URL).trim();
  const FLOW_API_KEY = (process.env.FLOW_API_KEY || "").trim();

  // ?test=1 -> /webhook-test
  const useTest = event?.queryStringParameters?.test === "1";
  const prefix = useTest ? "/webhook-test" : "/webhook";

  const { payload, parsedAs, parseError } = parsePayload(event);
  const upstreamUrl = `${FLOW_BASE_URL}${prefix}${flowPath}`;

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

    const text = await upstream.text();
    return {
      statusCode: upstream.status,
      headers: {
        ...corsHeaders(origin),
        "Content-Type": upstream.headers.get("content-type") || "application/json",
        "x-api-version": VERSION,
      },
      body: text,
    };
  } catch (e) {
    const msg =
      String(e)?.includes("AbortError")
        ? `Upstream timeout after ${TIMEOUT_MS}ms`
        : String(e?.message || e);

    return json(502, origin, {
      ok: false,
      version: VERSION,
      message: "Gateway error ke n8n",
      detail: msg,
      meta: {
        upstreamUrl,
        parsedAs,
        ...(parseError ? { parseError } : {}),
        flow_base_set: Boolean(process.env.FLOW_BASE_URL),
        flow_key_set: Boolean(process.env.FLOW_API_KEY),
      },
    });
  }
}

export const handler = async (event) => {
  const origin = event?.headers?.origin || event?.headers?.Origin || "*";
  const method = event.httpMethod || "GET";
  const path = normalizePath(event);

  if (method === "OPTIONS") return { statusCode: 204, headers: corsHeaders(origin), body: "" };

  if (method === "GET" && path === "/health") {
    return json(200, origin, {
      ok: true,
      version: VERSION,
      service: "netlify-api-gateway",
      time: new Date().toISOString(),
    });
  }

  if (method !== "POST") {
    return json(405, origin, { ok: false, version: VERSION, message: `Method ${method} not allowed` });
  }

  if (path === "/auth/login") return proxyToN8n(event, origin, "/api/auth/login");
  if (path === "/auth/signup") return proxyToN8n(event, origin, "/api/auth/signup");

  return json(404, origin, { ok: false, version: VERSION, message: "Not Found", path, method });
};
