const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

export type ChatMessage = { role: "user" | "assistant"; content: string };

function headers(apiKey: string) {
  return {
    "x-api-key": apiKey,
    "anthropic-version": ANTHROPIC_VERSION,
    "content-type": "application/json",
  };
}

export function anthropicCall(
  apiKey: string,
  opts: { model: string; system: string; messages: ChatMessage[]; maxTokens: number; stream?: boolean },
) {
  return fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify({
      model: opts.model,
      system: opts.system,
      messages: opts.messages,
      max_tokens: opts.maxTokens,
      stream: opts.stream ?? false,
    }),
  });
}

// Re-emits Anthropic's SSE stream as OpenAI-style `data: {choices:[{delta:{content}}]}`
// chunks so the existing RootBot client parser keeps working unchanged.
export function toOpenAiSse(body: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  const emit = (controller: TransformStreamDefaultController<Uint8Array>, text: string) => {
    const chunk = { choices: [{ delta: { content: text } }] };
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
  };
  return body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 1);
          if (!line.startsWith("data:")) continue;
          try {
            const evt = JSON.parse(line.slice(5).trim());
            if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
              emit(controller, evt.delta.text);
            }
          } catch {
            // partial or non-JSON line; ignore
          }
        }
      },
      flush(controller) {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      },
    }),
  );
}

export function extractJsonObject(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("No JSON object in model response");
  return JSON.parse(text.slice(start, end + 1));
}
