export const handler = async (event) => {
  try {
    const url = process.env.N8N_WEBHOOK_URL;
    if (!url) {
      return {
        statusCode: 500,
        body: JSON.stringify({ ok: false, error: "N8N_WEBHOOK_URL is not set" }),
      };
    }

    const payload = event.body ? JSON.parse(event.body) : {};

    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        source: "netlify",
        ...payload,
      }),
    });

    const text = await res.text();
    return {
      statusCode: res.status,
      headers: { "content-type": "application/json" },
      body: text || JSON.stringify({ ok: true }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: String(e) }),
    };
  }
};
