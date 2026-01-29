// netlify/functions/flow-proxy.js
// Revisi: versi marker + debug kuat + fallback URL n8n + CORS + timeout + bypass env (agar tidak lagi "env not set")

const VERSION = "v3-2026-01-29-REV"; // <-- ubah kalau mau tracking deploy
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

// Helper: get query param
function qp(event, key) {
  return event?.queryStringParameters?.[key];
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

  // Read env safely
  const envUrlRaw = (process.env.N8N_WEBHOOK_URL || "").trim();

  /**
   * Revisi penting:
   * - Selalu ada fallback DEFAULT_N8N_WEBHOOK_URL (jadi tidak akan error "env not set" lagi)
   * - Bisa override target via query param `target` untuk testing (optional)
   */
  const targetOverride = (qp(event, "target") || "").trim();
  const chosenUrl = targetOverride || envUrlRaw || DEFAULT_N8N_WEBHOOK_URL;

  // 2) GET: health check + debug info
  if (method === "GET") {
    const debug = qp(event, "debug") === "1";

    return {
      statusCode: 200,
      headers: baseHeaders(),
      body: JSON.stringify({
        ok: true,
        version: VERSION,
        message: "flow-proxy is running. Send a POST JSON to forward to n8n.",
        methodAccepted: ["POST"],
        debug: debug
          ? {
              envPresent: Boolean(envUrlRaw),
              envUrlRaw: envUrlRaw || null,
              targetOverride: targetOverride || null,
              chosenUrl,
              note:
                "If you still see old behavior, you are hitting an older deploy. Use deploy-specific URL from Netlify deploy hash.",
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
        version: VERSION,
        error: `Method ${method} not allowed. Use POST.`,
      }),
    };
  }

  // 4) Parse incoming JSON body (optional; allow empty body)
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
          version: VERSION,
          error: "Invalid JSON body",
          detail: parsed.error,
        }),
      };
    }
    payload = parsed.value ?? {};
  }

  // 5) Forward to n8n with timeout
  const controller = new AbortController();
  const timeoutMs = 15000;
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(chosenUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        source: "netlify",
        receivedAt: new Date().toISOString(),
        version: VERSION,
        ...payload,
      }),
      signal: controller.signal,
    });

    const resText = await res.text();
    clearTimeout(t);

    // Preserve n8n response if JSON; otherwise return as text
    const maybeJson = safeJsonParse(resText);
    const bodyOut = maybeJson.ok
      ? maybeJson.value
      : { ok: res.ok, status: res.status, text: resText };

    return {
      statusCode: res.status,
      headers: baseHeaders({
        "x-flow-proxy-version": VERSION,
      }),
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
      headers: baseHeaders({
        "x-flow-proxy-version": VERSION,
      }),
      body: JSON.stringify({
        ok: false,
        version: VERSION,
        error: "Failed to call n8n",
        detail: msg,
        debug: {
          envPresent: Boolean(envUrlRaw),
          targetOverride: targetOverride || null,
          chosenUrl,
        },
      }),
    };
  }
};
