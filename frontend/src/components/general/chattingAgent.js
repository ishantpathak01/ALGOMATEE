import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Close, Send } from "@mui/icons-material";
import { Sparkles, RotateCcw } from "lucide-react";
import { sendChatMessage } from "../../APIs/chatbot";
import ReactMarkdown from "react-markdown";

const QUICK_PROMPTS = [
  "How do I crack DSA interviews?",
  "Explain Big O notation",
  "Best resources for system design?",
  "Tips for competitive programming",
];

/* ── Typing indicator ── */
const TypingDots = () => (
  <div className="flex items-center gap-1 px-3 py-2">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="w-2 h-2 rounded-full bg-blue-400"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
      />
    ))}
  </div>
);

/* ── Single message bubble ── */
const MessageBubble = ({ msg, index }) => {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 mb-1">
          <Sparkles size={11} className="text-white" />
        </div>
      )}
      <div
        className={`max-w-[78%] px-3 py-2 rounded-xl text-sm leading-relaxed
          ${isUser
            ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-slate-800 border border-slate-700 text-gray-200 rounded-bl-sm"
          }`}
      >
        {isUser ? (
          <p>{msg.content}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-pre:bg-slate-900 prose-pre:rounded-lg prose-pre:text-xs prose-code:text-blue-300 prose-code:bg-slate-900 prose-code:px-1 prose-code:rounded prose-headings:text-white prose-strong:text-white">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
};

/* ── Main component ── */
const ChatbotModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hey! 👋 I'm **AlgoBot**, your AI coding companion.\n\nAsk me anything about DSA, system design, interview prep, or full-stack dev!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const sendMessage = async (text) => {
    const userText = (text ?? input).trim();
    if (!userText || loading) return;

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    // Send all history (exclude the initial greeting for context clarity)
    const history = newMessages.map(({ role, content }) => ({ role, content }));
    const res = await sendChatMessage(history);

    setLoading(false);
    if (res.status === 200) {
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
    } else {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ ${res.message || "Something went wrong. Please try again."}` },
      ]);
    }
  };

  const reset = () => {
    setMessages([{ role: "assistant", content: "Hey! 👋 I'm **AlgoBot**, your AI coding companion.\n\nAsk me anything about DSA, system design, interview prep, or full-stack dev!" }]);
    setInput("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="chatbot"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.2 }}
          className="z-50 fixed right-4 bottom-4"
        >
          <div className="w-[420px] h-[620px] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-700 bg-[#111827]">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-blue-400" />
                <span className="text-white font-semibold text-sm">AlgoBot</span>
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              </div>
              <div className="flex items-center gap-1">
                <button onClick={reset} title="Clear" className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors">
                  <RotateCcw size={14} />
                </button>
                <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors">
                  <Close fontSize="small" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} index={i} />
              ))}

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 mb-1">
                    <Sparkles size={11} className="text-white" />
                  </div>
                  <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-sm">
                    <TypingDots />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick prompts */}
            {messages.length === 1 && !loading && (
              <div className="px-4 pb-3 grid grid-cols-2 gap-2 shrink-0">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="text-left text-xs text-slate-400 border border-slate-700 hover:border-blue-500/50 hover:text-blue-400 rounded-lg px-3 py-2 transition-all leading-snug"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 border-t border-slate-700 flex items-end gap-2 shrink-0">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 96) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                }}
                placeholder="Ask anything…"
                disabled={loading}
                className="flex-1 resize-none bg-slate-800 border border-slate-600 focus:border-blue-500 text-white text-sm rounded-lg px-3 py-2 outline-none placeholder-slate-500 transition-colors leading-relaxed disabled:opacity-50 max-h-24"
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Send fontSize="small" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatbotModal;

