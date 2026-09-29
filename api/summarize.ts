// Vercel Serverless Function — secure Groq proxy.
// Client calls POST /api/summarize, server injects GROQ_API_KEY.
// Never expose GROQ_API_KEY to the browser (no VITE_ prefix).

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
// Env-configurable so a future deprecation is a config change, not a code change.
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const MAX_BODY_CHARS = 120000;

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(501).json({
      error: "GROQ_API_KEY is not configured on the server. Add it in Vercel Project Settings → Environment Variables.",
      code: "MISSING_SERVER_KEY",
    });
  }

  const { systemPrompt, userPrompt, isMerge } = req.body ?? {};
  if (typeof systemPrompt !== "string" || typeof userPrompt !== "string") {
    return res.status(400).json({ error: "Missing systemPrompt or userPrompt." });
  }
  if (systemPrompt.length + userPrompt.length > MAX_BODY_CHARS) {
    return res.status(413).json({ error: "Transcript too large for a single request." });
  }

  const extraInstruction = isMerge
    ? "\n\nYou are merging multiple partial summaries of a long meeting. Combine them into a single coherent result. Deduplicate action items and decisions."
    : "";

  try {
    const groqRes = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt + extraInstruction },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (groqRes.status === 401) {
      return res.status(401).json({ error: "Invalid Groq API key on server.", code: "INVALID_KEY" });
    }
    if (groqRes.status === 429) {
      return res.status(429).json({ error: "Groq rate limit reached. Try again in a moment.", code: "RATE_LIMIT" });
    }
    if (!groqRes.ok) {
      let detail = "";
      try {
        const errBody = await groqRes.json();
        detail = errBody?.error?.message || "";
      } catch {
        /* ignore */
      }
      return res.status(502).json({ error: `Groq API error (${groqRes.status}): ${detail || groqRes.statusText}` });
    }

    const data = await groqRes.json();
    const content: string = data?.choices?.[0]?.message?.content ?? "";
    if (!content) {
      return res.status(502).json({ error: "Empty response from Groq." });
    }
    // Validate it's parseable JSON with a summary before returning.
    try {
      const parsed = JSON.parse(content);
      if (!parsed || typeof parsed.summary !== "string") {
        return res.status(502).json({ error: "Groq returned malformed JSON." });
      }
    } catch {
      return res.status(502).json({ error: "Groq returned invalid JSON." });
    }
    return res.status(200).json({ content });
  } catch {
    return res.status(502).json({ error: "Network error contacting Groq." });
  }
}
