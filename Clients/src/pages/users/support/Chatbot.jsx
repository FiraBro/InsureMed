import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiSparkles,
  HiChevronDown,
  HiOutlinePaperAirplane,
  HiOutlineChatAlt2,
  HiOutlineShieldCheck,
  HiOutlineTicket,
} from "react-icons/hi"; // Modern, thin-line icons
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatbot } from "@/hooks/useChat";

export default function PremiumInsuranceChatbot({ userId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  const { messages, sendMessage, isLoading } = useChatbot(userId);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 30, scale: 0.9, filter: "blur(10px)" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="mb-6 w-[420px] max-w-[90vw] h-[650px] flex flex-col overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/80 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)]"
          >
            {/* Elegant Header */}
            <div className="relative p-6 pb-4 bg-gradient-to-b from-blue-50/50 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                      <HiSparkles className="text-white text-2xl animate-pulse" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-white rounded-full" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 tracking-tight">
                      FiraBoss Concierge
                    </h3>
                    <p className="text-[11px] font-medium text-blue-600 uppercase tracking-widest">
                      Premium Support AI
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                >
                  <HiChevronDown size={24} />
                </button>
              </div>

              {/* Trust Indicator */}
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-100 rounded-full text-[10px] font-semibold text-slate-500 shadow-sm whitespace-nowrap">
                  <HiOutlineShieldCheck className="text-blue-500" /> Secure
                  Encryption
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-100 rounded-full text-[10px] font-semibold text-slate-500 shadow-sm whitespace-nowrap">
                  <HiOutlineChatAlt2 className="text-blue-500" /> 24/7 Response
                </span>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 no-scrollbar bg-transparent">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                  <div className="p-4 bg-slate-100 rounded-full">
                    <HiOutlineChatAlt2 size={32} />
                  </div>
                  <p className="text-sm font-medium">
                    Ask about your claims, coverage,
                    <br />
                    or password resets.
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`relative max-w-[85%] px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                      msg.role === "user"
                        ? "bg-slate-900 text-white rounded-[1.5rem] rounded-tr-none"
                        : "bg-white border border-slate-100 text-slate-800 rounded-[1.5rem] rounded-tl-none"
                    }`}
                  >
                    {msg.content}

                    {/* Ticket UI: Modern Bento Style */}
                    {msg.status === "unresolved" && msg.ticketId && (
                      <div className="mt-4 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                          <HiOutlineTicket size={48} />
                        </div>
                        <div className="flex items-center gap-2 text-blue-700 font-bold text-[10px] uppercase tracking-tighter mb-2">
                          Request Logged
                        </div>
                        <div className="text-xl font-bold text-blue-900 tabular-nums mb-1">
                          #{msg.ticketId.split("-")[1]}
                        </div>
                        <p className="text-[11px] text-blue-600/80 leading-tight">
                          We've escalated this to a human agent. Expect an
                          update in the "My Tickets" section.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Input Bar: Clean Floating Design */}
            <div className="p-6 pt-2 bg-gradient-to-t from-white via-white/80 to-transparent">
              <form
                onSubmit={handleSubmit}
                className="relative flex items-center bg-white/50 backdrop-blur-md border border-slate-200/60 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-1.5 transition-all duration-300 focus-within:shadow-[0_8px_30px_rgba(59,130,246,0.12)] focus-within:border-blue-400/50 focus-within:bg-white"
              >
                {/* Minimalist Attachment/Plus Icon for that "Real App" feel */}
                <div className="pl-2 pr-1">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer transition-colors">
                    <span className="text-xl font-light">+</span>
                  </div>
                </div>

                <Input
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="border-none focus-visible:ring-0 placeholder:text-slate-400 text-sm h-11 bg-transparent selection:bg-blue-100"
                  disabled={isLoading}
                />

                <Button
                  type="submit"
                  size="icon"
                  disabled={isLoading || !input.trim()}
                  className={`
        relative h-10 w-10 shrink-0 overflow-hidden rounded-xl transition-all duration-300
        ${
          input.trim()
            ? "bg-blue-500 text-white shadow-lg shadow-blue-200 translate-x-0 opacity-100"
            : "bg-blue-100 text-slate-400 translate-x-2 opacity-0 pointer-events-none"
        }
      `}
                >
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center"
                      >
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="send"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                      >
                        <HiOutlinePaperAirplane
                          className="rotate-45"
                          size={20}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </form>

              {/* Micro-text Branding */}
              <p className="text-[10px] text-center mt-3 text-slate-400 font-medium tracking-wide uppercase">
                Powered by FiraBoss Intelligence
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 w-10 rounded-[2rem] bg-blue-500 text-white flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:bg-blue-600 transition-colors"
      >
        {isOpen ? <HiChevronDown size={32} /> : <HiSparkles size={36} />}
      </motion.button>
    </div>
  );
}
