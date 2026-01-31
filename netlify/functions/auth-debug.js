// netlify/functions/auth-debug.js (ESM)
// Debug helper: cek apakah login chain berhasil (App/Netlify -> n8n -> Neon)
const VERSION = "auth-debug-v1-2026-01-31";

function cors(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  };
}

function json(statusCode, origin, data) {
  return {
    statusCode,
    headers: { ...cors(origin), "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(data),
  };
}

function safeParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function readBodyJson(event) {
  if (!event?.body) return {};
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body;
  return safeParseJson(raw) || {};
}

export const handler = async (event) => {
  const origin = event?.headers?.origin || event?.headers?.Origin || "*";
  const method = event?.httpMethod || "GET";

  if (method === "OPTIONS") {
    return { statusCode: 204, headers: cors(origin), body: "" };
  }

  // Tentukan URL site (Netlify)
  const proto = String(event?.headers?.["x-forwarded-proto"] || "https")
    .split(",")[0]
    .trim();
  const host = event?.headers?.host;
  const siteUrl = String(
    process.env.URL ||
      process.env.DEPLOY_PRIME_URL ||
      (host ? `${proto}://${host}` : "")
  ).replace(/\/$/, "");

  const target = `${siteUrl}/api/auth/login`; // lewat api.js (redirect netlify.toml)

  if (method === "GET") {
    return json(200, origin, {
      ok: true,
      version: VERSION,
      message: "POST JSON ke endpoint ini untuk test login.",
      target,
      example_body: { identifier: "email-atau-mobile", password: "Rahasia123!" },
      example_curl: `curl -X POST "${siteUrl}/.netlify/functions/auth-debug" -H "Content-Type: application/json" -d '{"identifier":"naufal_test_1@example.com","password":"Rahasia123!"}'`,
    });
  }

  if (method !== "POST") {
    return json(405, origin, { ok: false, version: VERSION, message: "Use GET or POST" });
  }

  const body = readBodyJson(event);

  // fleksibel: terima identifier/email/mobile
  const identifier =
    body.identifier ??
    body.email ??
    body.email_or_mobile ??
    body.mobile ??
    body.username ??
    null;
  const password = body.password ?? null;

  if (!identifier || !password) {
    return json(400, origin, {
      ok: false,
      version: VERSION,
      message: "Body wajib berisi identifier + password",
      got: { hasIdentifier: Boolean(identifier), hasPassword: Boolean(password) },
      example: { identifier: "naufal_test_1@example.com", password: "Rahasia123!" },
    });
  }

  const started = Date.now();

  let upstreamStatus = 0;
  let upstreamText = "";
  let upstreamJson = null;

  try {
    const res = await fetch(target, {
      method: "POST",
      headers: { "content-type": "application/json" },
      // forward payload login ke endpoint /api/auth/login
      body: JSON.stringify({ identifier, password }),
    });

    upstreamStatus = res.status;
    upstreamText = await res.text();
    upstreamJson = safeParseJson(upstreamText);
  } catch (e) {
    return json(502, origin, {
      ok: false,
      version: VERSION,
      message: "Gagal menghubungi endpoint login (/api/auth/login)",
      target,
      error: String(e),
    });
  }

  const elapsed_ms = Date.now() - started;

  // Tentukan sukses/gagal dari respons upstream
  const loginOk =
    upstreamStatus >= 200 &&
    upstreamStatus < 300 &&
    (upstreamJson?.ok === true ||
      upstreamJson?.success === true ||
      upstreamJson?.user != null);

  return json(200, origin, {
    ok: loginOk,
    version: VERSION,
    target,
    elapsed_ms,
    sent: { identifier }, // password tidak ditampilkan
    upstream: {
      status: upstreamStatus,
      body: upstreamJson ?? upstreamText?.slice(0, 1200),
    },
  });
};
