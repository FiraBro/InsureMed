import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  HiSparkles,
  HiChevronDown,
  HiOutlinePaperAirplane,
  HiOutlineChatAlt2,
} from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatbot } from "@/hooks/useChat";

export default function PremiumInsuranceChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const { messages, sendMessage, isLoading } = useChatbot();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [messages, isLoading, reduceMotion]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  const canSend = input.trim().length > 0 && !isLoading;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {isOpen && (
          <motion.section
            role="dialog"
            aria-label="FiraBoss Concierge chat"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="mb-4 flex h-[620px] max-h-[calc(100vh-7rem)] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
          >
            {/* Header */}
            <header className="flex items-center justify-between bg-blue-600 px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                  <HiSparkles className="text-lg" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold leading-tight">
                    FiraBoss Concierge
                  </h3>
                  <p className="mt-0.5 text-xs text-blue-100">
                    Premium Support AI
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Minimize chat"
                className="rounded-lg p-2 text-blue-100 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <HiChevronDown size={22} />
              </button>
            </header>

            {/* Chat body */}
            <div
              role="log"
              aria-live="polite"
              className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-5"
            >
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                  <HiOutlineChatAlt2 size={32} className="text-blue-300" />
                  <p className="text-sm leading-relaxed text-slate-500">
                    Ask about your claims, coverage,
                    <br />
                    or password resets.
                  </p>
                </div>
              )}

              {messages.map((msg, i) => {
                const isUser = msg.role === "user";
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed ${
                        isUser
                          ? "rounded-2xl rounded-br-sm bg-blue-600 text-white"
                          : "rounded-2xl rounded-bl-sm border border-slate-200 bg-white text-slate-800"
                      }`}
                    >
                      {msg.content}

                      {!isUser && msg.sources?.length > 0 && (
                        <div className="mt-2 border-t border-slate-200 pt-2 text-xs text-slate-500">
                          <span className="font-medium">Sources:</span>
                          <ul className="mt-1 list-inside list-disc">
                            {msg.sources.map((source, sourceIndex) => (
                              <li key={`${source.documentName || source.name || "source"}-${sourceIndex}`}>
                                {source.documentName || source.name || "Policy document"}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Ticket confirmation */}
                      {msg.status === "unresolved" && msg.ticketId && (
                        <div className="mt-3 rounded-lg border-l-4 border-blue-600 bg-blue-50 p-3">
                          <p className="text-xs font-semibold text-blue-700">
                            Request Logged
                          </p>
                          <p className="mt-0.5 text-lg font-semibold tabular-nums text-blue-900">
                            #{msg.ticketId.split("-")[1]}
                          </p>
                          <p className="mt-1 text-xs leading-snug text-slate-600">
                            We've escalated this to a human agent. Expect an
                            update in the "My Tickets" section.
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {isLoading && (
                <div
                  className="flex justify-start"
                  aria-label="Assistant is typing"
                >
                  <div className="flex gap-1 rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3.5">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.3s] motion-reduce:animate-none" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.15s] motion-reduce:animate-none" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 motion-reduce:animate-none" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Input */}
            <footer className="border-t border-slate-200 bg-white p-3">
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white py-1.5 pl-3 pr-1.5 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/15"
              >
                <Input
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  aria-label="Message"
                  className="h-9 flex-1 border-none bg-transparent px-0 text-sm text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  aria-label="Send message"
                  disabled={!canSend}
                  className={`h-9 w-9 shrink-0 rounded-lg transition-colors ${
                    canSend
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                  ) : (
                    <HiOutlinePaperAirplane className="rotate-90" size={18} />
                  )}
                </Button>
              </form>
            </footer>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Launcher */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        aria-expanded={isOpen}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      >
        {isOpen ? <HiChevronDown size={28} /> : <HiSparkles size={26} />}
      </button>
    </div>
  );
}
