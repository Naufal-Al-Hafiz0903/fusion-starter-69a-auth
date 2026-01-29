// netlify/functions/flow-proxy.js
// Revisi utama:
// - Tidak lagi gagal kalau body bukan JSON (tidak return 400)
// - Coba parse JSON, kalau gagal -> coba parse form-urlencoded, kalau gagal -> kirim rawBody
// - Tetap forward ke n8n dengan payload yang SELALU JSON valid
// - GET debug untuk cek versi + URL yang dipakai
// - CORS + timeout + response pass-through aman

const VERSION = "v4-2026-01-29-FIX";
const DEFAULT_N8N_WEBHOOK_URL =
  "https://flow.eraenterprise.id/webhook/eramed-clara-appsmith";

function baseHeaders(extra = {}) {
  return {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "Content-Type, Authorization",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    ...extra,
  };
}

function safeJsonParse(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

function getRawBody(event) {
  if (!event?.body) return "";
  if (event.isBase64Encoded) {
    return Buffer.from(event.body, "base64").toString("utf8");
  }
  return event.body;
}

function getHeader(event, name) {
  const h = event?.headers || {};
  const key = Object.keys(h).find((k) => k.toLowerCase() === name.toLowerCase());
  return key ? h[key] : "";
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

export const handler = async (event) => {
  const method = event.httpMethod || "GET";

  // CORS preflight
  if (method === "OPTIONS") {
    return { statusCode: 204, headers: baseHeaders(), body: "" };
  }

  // target URL (ENV atau fallback)
  const envUrl = (process.env.N8N_WEBHOOK_URL || "").trim();
  const chosenUrl = envUrl || DEFAULT_N8N_WEBHOOK_URL;

  // GET: health check
  if (method === "GET") {
    const debug = event?.queryStringParameters?.debug === "1";
    return {
      statusCode: 200,
      headers: baseHeaders({ "x-flow-proxy-version": VERSION }),
      body: JSON.stringify({
        ok: true,
        version: VERSION,
        message: "flow-proxy is running. Send POST to forward to n8n.",
        debug: debug
          ? {
              envPresent: Boolean(envUrl),
              envUrlRaw: envUrl || null,
              chosenUrl,
            }
          : undefined,
      }),
    };
  }

  // Only POST
  if (method !== "POST") {
    return {
      statusCode: 405,
      headers: baseHeaders({ "x-flow-proxy-version": VERSION }),
      body: JSON.stringify({
        ok: false,
        version: VERSION,
        error: `Method ${method} not allowed. Use POST.`,
      }),
    };
  }

  // Ambil raw body + content-type
  const rawBody = getRawBody(event);
  const contentTypeRaw = getHeader(event, "content-type") || "";
  const contentType = contentTypeRaw.split(";")[0].trim().toLowerCase();

  // Parse body dengan fallback (TIDAK error 400 lagi)
  let parsedAs = "empty";
  let payload = {};
  let parseError = null;

  if (rawBody) {
    // 1) coba JSON dulu
    const j = safeJsonParse(rawBody);
    if (j.ok) {
      payload = j.value ?? {};
      parsedAs = "json";
    } else {
      // 2) coba form-urlencoded
      const f = parseFormUrlEncoded(rawBody);
      if (f.ok && Object.keys(f.value || {}).length > 0) {
        payload = f.value;
        parsedAs = "form-urlencoded";
      } else {
        // 3) gagal semua -> kirim raw
        payload = { rawBody };
        parsedAs = "raw";
        parseError = j.error;
      }
    }
  }

  // Forward ke n8n (SELALU JSON valid)
  const controller = new AbortController();
  const timeoutMs = 15000;
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const forwardBody = {
      source: "netlify",
      version: VERSION,
      receivedAt: new Date().toISOString(),
      contentType: contentType || null,
      parsedAs,
      ...(parseError ? { parseError } : {}),
      payload,
    };

    const res = await fetch(chosenUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(forwardBody),
      signal: controller.signal,
    });

    const resText = await res.text();
    clearTimeout(t);

    // coba parse JSON response dari n8n
    const maybeJson = safeJsonParse(resText);
    const out = maybeJson.ok
      ? maybeJson.value
      : { ok: res.ok, status: res.status, text: resText };

    return {
      statusCode: res.status,
      headers: baseHeaders({ "x-flow-proxy-version": VERSION }),
      body: JSON.stringify(out),
    };
  } catch (e) {
    clearTimeout(t);

    const msg =
      String(e)?.includes("AbortError")
        ? `Upstream timeout after ${timeoutMs}ms`
        : String(e);

    return {
      statusCode: 502,
      headers: baseHeaders({ "x-flow-proxy-version": VERSION }),
      body: JSON.stringify({
        ok: false,
        version: VERSION,
        error: "Failed to call n8n",
        detail: msg,
        envPresent: Boolean(envUrl),
        chosenUrl,
      }),
    };
  }
};
