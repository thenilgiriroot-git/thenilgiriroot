const GEMINI_CHAT_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

export type ChatMessage = { role: "user" | "assistant"; content: string };

// Gemini's streaming responses hang for this key, so callers make a normal
// (non-streaming) request and use textToSse() to hand the reply to the
// RootBot client in the SSE shape it already parses.
export function geminiCall(
  apiKey: string,
  opts: { model: string; system: string; messages: ChatMessage[]; stream?: boolean; json?: boolean },
) {
  return fetch(GEMINI_CHAT_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: opts.model,
      messages: [{ role: "system", content: opts.system }, ...opts.messages],
      stream: opts.stream ?? false,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
}

export function extractJsonObject(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("No JSON object in model response");
  return JSON.parse(text.slice(start, end + 1));
}

export function textToSse(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const chunks = text.match(/[\s\S]{1,24}/g) ?? [];
  const evt = (data: string) => encoder.encode("data: " + data + "\n\n");
  return new ReadableStream({
    start(controller) {
      for (const c of chunks) {
        controller.enqueue(evt(JSON.stringify({ choices: [{ delta: { content: c } }] })));
      }
      controller.enqueue(evt("[DONE]"));
      controller.close();
    },
  });
}
