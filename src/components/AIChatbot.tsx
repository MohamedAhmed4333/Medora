import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Loader2, ChevronDown } from "lucide-react";

interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
  time: string;
}

const suggestions = [
  "I have a persistent cough",
  "Chest pain when breathing",
  "High fever and headache",
  "Blurry vision recently",
];

const aiResponses: Record<string, string> = {
  default: "Thank you for sharing that. To help me give you better guidance, can you describe when these symptoms started and their severity on a scale of 1-10?",
  cough: "A persistent cough can indicate several conditions. Is it dry or productive? Have you noticed any fever, difficulty breathing, or blood in sputum? Based on your symptoms, I may recommend seeing a **Pulmonologist**.",
  chest: "Chest pain is something I take seriously. Is the pain sharp or dull? Does it radiate to your arm or jaw? Are you experiencing shortness of breath? Given these symptoms, I'd recommend an urgent consultation with a **Cardiologist**.",
  fever: "Fever with headache can indicate infections. What's your temperature? Have you had any rash, stiff neck, or sensitivity to light? Depending on severity, you may need to see an **Internal Medicine** specialist.",
  vision: "Vision changes warrant attention. Is the blurriness in one or both eyes? Is it sudden or gradual? I recommend seeing an **Ophthalmologist** for a proper evaluation.",
};

function getAIResponse(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("cough")) return aiResponses.cough;
  if (lower.includes("chest") || lower.includes("pain")) return aiResponses.chest;
  if (lower.includes("fever") || lower.includes("headache")) return aiResponses.fever;
  if (lower.includes("vision") || lower.includes("blurry") || lower.includes("eye")) return aiResponses.vision;
  return aiResponses.default;
}


interface ChatComponentProps {
  patientId: string; // جاي من الـ Auth state عندك
}

export default function AIChatbot({ user }) {
  const [open, setOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (eOrText: React.FormEvent | string) => {
    let userText: string;
    if (typeof eOrText === "string") {
      userText = eOrText.trim();
      if (!userText || isTyping) return;
    } else {
      eOrText.preventDefault();
      if (!input.trim() || isTyping) return;
      userText = input.trim();
      setInput("");
    }


    const formattedHistory = messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.text,
    }));

    const now = new Date();
    setMessages((prev) => [...prev, { id: now.getTime(), role: "user", text: userText, time: now.toLocaleTimeString() }]);
    setIsTyping(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient_id: user?.uid,
          user_message: userText,
          chat_history: formattedHistory,
        }),
      });

      if (!response.ok) throw new Error("Server error");

      const data = await response.json();

      const nowAi = new Date();
      setMessages((prev) => [...prev, { id: nowAi.getTime(), role: "assistant", text: data.reply, time: nowAi.toLocaleTimeString() }]);
    } catch (error) {
      console.error("Chat Error:", error);
      const errorTime = new Date();
      setMessages((prev) => [
        ...prev,
        {
          id: errorTime.getTime(),
          role: "assistant",
          text: "عذراً، واجهت مشكلة في الاتصال بالمساعد الطبي.",
          time: errorTime.toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  function renderText(text: string) {
    if (typeof text !== "string") {
      return String(text ?? "");
    }
    return text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
      part.startsWith("**") && part.endsWith("**")
        ? <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
        : part
    );
  }
  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold shadow-glow transition-all duration-300 bg-gradient-ai text-primary-foreground hover:scale-105 active:scale-95 ${open ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        <Bot className="h-5 w-5" />
        <span>Ask Medora AI</span>
        <span className="h-2 w-2 rounded-full bg-medical-green animate-pulse" />
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col w-80 sm:w-96 h-[520px] rounded-2xl overflow-hidden shadow-elevated animate-fade-in-up border border-border/50">
          {/* Header */}
          <div className="bg-gradient-hero px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-medical-green border-2 border-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary-foreground">Medora AI Assistant</p>
                <p className="text-xs text-primary-foreground/70">Online · Medical AI</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10 transition-colors"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-card">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
                {msg.role === "assistant" && (
                  <div className="h-7 w-7 rounded-full bg-gradient-ai flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                )}
                <div className="max-w-[80%]">
                  <div className={msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}>
                    <p className="leading-relaxed">{renderText(msg.text)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 px-1">{msg.time}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start gap-2">
                <div className="h-7 w-7 rounded-full bg-gradient-ai flex items-center justify-center shrink-0">
                  <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <div className="chat-bubble-ai flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-2 w-2 rounded-full bg-medical-teal animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 2 && (
            <div className="px-3 py-2 bg-card border-t border-border/50 flex gap-2 overflow-x-auto shrink-0">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs rounded-full px-3 py-1.5 border border-border text-muted-foreground whitespace-nowrap hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors shrink-0"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 bg-card border-t border-border/50 flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder="Describe your symptoms..."
              className="flex-1 rounded-xl px-3 py-2 text-sm bg-muted border border-transparent focus:outline-none focus:border-medical-teal focus:bg-card transition-colors"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              className="h-9 w-9 rounded-xl flex items-center justify-center bg-gradient-hero text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
