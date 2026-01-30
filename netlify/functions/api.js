@'
import express from "express";
import serverless from "serverless-http";

const app = express();

app.use(express.json({ limit: "2mb" }));

// CORS + preflight
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).send("");
  next();
});

// Health check
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "api", time: new Date().toISOString() });
});

// Proxy to flow
const FLOW_BASE_URL = process.env.FLOW_BASE_URL || "https://flow.eraenterprise.id";
const FLOW_API_KEY = process.env.FLOW_API_KEY || "";

async function proxyToFlow(req, res, path) {
  try {
    const upstream = await fetch(`${FLOW_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(FLOW_API_KEY ? { "X-API-Key": FLOW_API_KEY } : {})
      },
      body: JSON.stringify(req.body || {})
    });

    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/json");
    return res.send(text);
  } catch (e) {
    return res.status(502).json({
      ok: false,
      message: "Gateway error ke flow",
      detail: String(e?.message || e)
    });
  }
}

// AUTH endpoints
app.post("/auth/login", (req, res) => proxyToFlow(req, res, "/webhook/api/auth/login"));
app.post("/auth/signup", (req, res) => proxyToFlow(req, res, "/webhook/api/auth/signup"));

export const handler = serverless(app, { basePath: "/.netlify/functions/api" });
'@ | Set-Content -Encoding UTF8 netlify\functions\api.js
