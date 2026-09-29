import type { GroqResponse, ActionItem, MeetingResult, Priority } from "@/types";

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";
const MAX_WORDS_PER_CHUNK = 10000;

export class GroqError extends Error {
  code?: string;
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "GroqError";
  }
}

function getApiKey(): string {
  const stored = localStorage.getItem("groq_api_key");
  if (stored && stored.trim()) return stored.trim();
  const envKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
  if (envKey && envKey.trim() && envKey !== "your_groq_api_key_here") return envKey.trim();
  return "";
}

function buildSystemPrompt(meetingDate: string): string {
  return `You are a meeting-notes analyzer. Extract action items and a summary from the meeting transcript provided by the user.

Rules:
- Extract only real commitments or assigned tasks, not general discussion topics.
- The owner must be a person named in the transcript. Use null if the owner is unclear. Never invent names.
- Convert relative dates ("Friday", "next week", "end of month", etc.) into absolute YYYY-MM-DD dates using the meeting date provided: ${meetingDate}. Use null if no deadline is stated.
- Infer priority from urgency language. Default to "Medium".
- Write each task as a short imperative sentence starting with a verb.
- Return JSON only, no extra text.

Return exactly this JSON shape:
{
  "summary": "3-5 sentence overview of the meeting",
  "key_decisions": ["decision 1", "decision 2"],
  "open_questions": ["question 1", "question 2"],
  "action_items": [
    { "task": "...", "owner": "Name or null", "due_date": "YYYY-MM-DD or null", "priority": "High|Medium|Low" }
  ]
}`;
}

function buildUserPrompt(transcript: string, meetingDate: string, meetingTitle: string): string {
  return `Meeting title: ${meetingTitle || "(untitled)"}
Meeting date: ${meetingDate}

Transcript:
${transcript}`;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function chunkText(text: string, maxWords: number): string[] {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return [text];
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(" "));
  }
  return chunks;
}

async function callGroqProxy(systemPrompt: string, userPrompt: string, isMerge = false): Promise<GroqResponse> {
  let res: Response;
  try {
    res = await fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemPrompt, userPrompt, isMerge }),
    });
  } catch {
    throw new GroqError("Network error — check your internet connection and try again.");
  }
  if (res.status === 501) {
    const err = new GroqError(
      "Server Groq key missing. Add GROQ_API_KEY in Vercel env vars, or add a key in Settings for local dev.",
      501
    );
    err.code = "MISSING_SERVER_KEY";
    throw err;
  }
  if (res.status === 401) {
    throw new GroqError("Invalid API key. Check the server Groq key.", 401);
  }
  if (res.status === 429) {
    throw new GroqError("Rate limit reached. Please try again in a moment.", 429);
  }
  if (!res.ok) {
    let detail = "";
    try {
      const errBody = await res.json();
      detail = errBody?.error || "";
    } catch {
      /* ignore */
    }
    throw new GroqError(detail || `Request failed (${res.status}).`, res.status);
  }
  const data = await res.json();
  return parseGroqResponse(data?.content ?? "");
}

async function callGroqDirect(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  isMerge = false
): Promise<GroqResponse> {
  const extraInstruction = isMerge
    ? "\n\nYou are merging multiple partial summaries of a long meeting. Combine them into a single coherent result. Deduplicate action items and decisions."
    : "";

  const body = {
    model: MODEL,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt + extraInstruction },
      { role: "user", content: userPrompt },
    ],
  };

  let res: Response;
  try {
    res = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new GroqError("Network error — check your internet connection and try again.");
  }

  if (res.status === 401) {
    throw new GroqError("Invalid API key. Check your Groq API key in Settings.", 401);
  }
  if (res.status === 429) {
    throw new GroqError("Rate limit reached. Please try again in a moment.", 429);
  }
  if (!res.ok) {
    let detail = "";
    try {
      const errBody = await res.json();
      detail = errBody?.error?.message || "";
    } catch {
      /* ignore */
    }
    throw new GroqError(`Groq API error (${res.status}): ${detail || res.statusText}`, res.status);
  }

  const data = await res.json();
  const content: string = data?.choices?.[0]?.message?.content ?? "";
  return parseGroqResponse(content);
}

async function callGroq(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  isMerge = false
): Promise<GroqResponse> {
  // Production (Vercel): prefer secure server proxy so no key is exposed.
  // Local dev (`vite dev`): no /api route, so use direct Groq call with local key.
  if (!import.meta.env.DEV) {
    try {
      return await callGroqProxy(systemPrompt, userPrompt, isMerge);
    } catch (e) {
      if (e instanceof GroqError && e.code === "MISSING_SERVER_KEY" && apiKey) {
        return callGroqDirect(apiKey, systemPrompt, userPrompt, isMerge);
      }
      throw e;
    }
  }
  if (!apiKey) {
    // No local key in dev — try proxy anyway (works under `vercel dev`).
    try {
      return await callGroqProxy(systemPrompt, userPrompt, isMerge);
    } catch {
      throw new GroqError("No API key configured. Add your Groq API key in Settings or .env.");
    }
  }
  return callGroqDirect(apiKey, systemPrompt, userPrompt, isMerge);
}

function parseGroqResponse(content: string): GroqResponse {
  try {
    const parsed = JSON.parse(content);
    if (!parsed || typeof parsed.summary !== "string") {
      throw new Error("Missing summary");
    }
    return {
      summary: parsed.summary,
      key_decisions: Array.isArray(parsed.key_decisions) ? parsed.key_decisions : [],
      open_questions: Array.isArray(parsed.open_questions) ? parsed.open_questions : [],
      action_items: Array.isArray(parsed.action_items) ? parsed.action_items : [],
    };
  } catch {
    throw new Error("Failed to parse JSON response");
  }
}

function normalizeActionItems(items: GroqResponse["action_items"]): ActionItem[] {
  return items.map((item, idx) => ({
    id: `item-${Date.now()}-${idx}`,
    task: item.task || "",
    owner: item.owner || "",
    due_date: item.due_date || "",
    priority: (["High", "Medium", "Low"].includes(item.priority) ? item.priority : "Medium") as Priority,
    done: false,
  }));
}

export async function generateSummary(
  transcript: string,
  meetingDate: string,
  meetingTitle: string
): Promise<MeetingResult> {
  if (!transcript || !transcript.trim()) {
    throw new GroqError("Transcript is empty. Paste meeting notes or upload a .txt/.md file.");
  }
  if (transcript.trim().length < 20) {
    throw new GroqError("Transcript is too short to summarize. Add more detail.");
  }
  const apiKey = getApiKey();
  if (!apiKey && import.meta.env.DEV) {
    throw new GroqError("No API key configured. Add your Groq API key in Settings or .env.");
  }

  const systemPrompt = buildSystemPrompt(meetingDate);
  const wordCount = countWords(transcript);

  if (wordCount <= MAX_WORDS_PER_CHUNK) {
    const userPrompt = buildUserPrompt(transcript, meetingDate, meetingTitle);
    let response: GroqResponse;
    try {
      response = await callGroq(apiKey, systemPrompt, userPrompt);
    } catch (e) {
      if (e instanceof GroqError) throw e;
      // Retry once on parse failure
      response = await callGroq(apiKey, systemPrompt, userPrompt);
    }
    return {
      summary: response.summary,
      key_decisions: response.key_decisions,
      open_questions: response.open_questions,
      action_items: normalizeActionItems(response.action_items),
    };
  }

  // Long transcript: chunk, summarize each, then merge
  const chunks = chunkText(transcript, MAX_WORDS_PER_CHUNK);
  const partialResults: GroqResponse[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const userPrompt = buildUserPrompt(chunks[i], meetingDate, meetingTitle) + `\n\n(This is part ${i + 1} of ${chunks.length}.)`;
    const response = await callGroq(apiKey, systemPrompt, userPrompt);
    partialResults.push(response);
  }

  // Merge
  const mergedTranscript = partialResults
    .map(
      (r, i) =>
        `Part ${i + 1}:\nSummary: ${r.summary}\nDecisions: ${r.key_decisions.join("; ")}\nQuestions: ${r.open_questions.join("; ")}\nAction items: ${r.action_items.map((a) => `${a.task} — ${a.owner || "Unassigned"} — due ${a.due_date || "N/A"} — ${a.priority}`).join("; ")}`
    )
    .join("\n\n");

  const mergeUserPrompt = `Merge these partial meeting summaries into one coherent result:\n\n${mergedTranscript}`;
  const merged = await callGroq(apiKey, systemPrompt, mergeUserPrompt, true);

  return {
    summary: merged.summary,
    key_decisions: merged.key_decisions,
    open_questions: merged.open_questions,
    action_items: normalizeActionItems(merged.action_items),
  };
}
