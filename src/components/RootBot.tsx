import { useState, useRef, useEffect } from "react";
import { X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { trackChatbotOpen, trackChatbotStart } from "@/lib/analytics";
import { supabase } from "@/integrations/supabase/client";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rootbot-chat`;

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_RE = /(?:\+?\d[\s\-().]*){8,}/;

function extractContact(text: string): { email?: string; phone?: string } {
  const email = text.match(EMAIL_RE)?.[0];
  const phoneRaw = text.match(PHONE_RE)?.[0];
  const phone = phoneRaw && phoneRaw.replace(/\D+/g, "").length >= 8 ? phoneRaw.trim() : undefined;
  return { email, phone };
}

export default function RootBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm **RootBot** 🍟 — your guide to The Nilgiri Root. Ask me about our products, process, or how to partner with us!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const hasOpenedRef = useRef(false);
  const hasStartedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Fire chatbot_open exactly once per session-open, not on close.
  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next && !hasOpenedRef.current) {
      hasOpenedRef.current = true;
      trackChatbotOpen("floating-widget");
    }
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      trackChatbotStart();
    }
    const userMsg: Msg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    // Lead capture: if user shared email/phone, forward to centralized lead pipeline.
    const { email: capEmail, phone: capPhone } = extractContact(userMsg.content);
    if (capEmail || capPhone) {
      const transcript = newMessages
        .slice(-6)
        .map((m) => `${m.role === "user" ? "User" : "Bot"}: ${m.content}`)
        .join("\n");
      supabase.functions
        .invoke("submit-lead", {
          body: {
            source_type: "chatbot",
            source_detail: "rootbot",
            name: "",
            email: capEmail ?? "",
            phone: capPhone ?? "",
            message: transcript,
            page_url: typeof window !== "undefined" ? window.location.href : "",
          },
        })
        .catch(() => {/* non-blocking */});
    }

    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: "Failed to connect" }));
        setMessages((prev) => [...prev, { role: "assistant", content: err.error || "Sorry, something went wrong. Please try again." }]);
        setLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && prev.length > newMessages.length) {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't connect. Please try again later." }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={handleToggle}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-lg shadow-accent/30 hover:scale-110 transition-all duration-300 ${open ? "scale-0" : "scale-100"}`}
        aria-label="Open RootBot chat"
      >
        <span className="text-2xl">🍟</span>
      </button>

      {/* Chat panel */}
      <div
        className={`fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-4rem)] flex flex-col rounded-2xl overflow-hidden glass-card border border-accent/20 shadow-2xl shadow-accent/10 transition-all duration-300 origin-bottom-right ${
          open ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/30 bg-card/60">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍟</span>
            <div>
              <p className="font-display text-sm font-bold text-foreground">RootBot</p>
              <p className="text-2xs font-body text-accent">The Nilgiri Root Assistant</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm font-body ${
                  msg.role === "user"
                    ? "bg-accent text-accent-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          {loading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-border/30 bg-card/60">
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about our products..."
              className="flex-1 bg-muted/50 border border-border/30 rounded-full px-4 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/50"
              disabled={loading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || !input.trim()}
              className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 h-10 w-10 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
