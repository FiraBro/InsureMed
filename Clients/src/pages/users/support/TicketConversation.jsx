import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiSend, FiCheck } from "react-icons/fi";
import { useTickets } from "@/hooks/useTicket";
import { Button } from "@/components/ui/button";
import { Loader2, Paperclip, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react"; // Import emoji picker

const TicketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [reply, setReply] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const emojiPickerRef = useRef(null);

  const {
    ticketDetails: ticket,
    isLoadingDetails,
    replyToTicket,
    isReplying,
  } = useTickets(id);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [ticket?.messages]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSendReply = (e) => {
    if (e) e.preventDefault();
    if (!reply.trim() || isReplying) return;
    replyToTicket(
      { id, message: reply, sender: "USER" },
      {
        onSuccess: () => {
          setReply("");
          setShowEmoji(false);
        },
      },
    );
  };

  const handleKeyDown = (e) => {
    // Desktop: Enter sends, Shift+Enter creates new line
    // Mobile: Keyboard "Go/Send" button usually triggers a form submit or Enter
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 768) {
      e.preventDefault();
      handleSendReply();
    }
  };

  const onEmojiClick = (emojiData) => {
    setReply((prev) => prev + emojiData.emoji);
  };

  if (isLoadingDetails)
    return (
      <div className="flex h-[calc(100dvh-6rem)] min-h-[28rem] items-center justify-center overflow-hidden rounded-2xl bg-[#8DB0D1] sm:h-[calc(100dvh-7rem)] lg:h-[calc(100dvh-8rem)]">
        <Loader2 className="animate-spin text-white" size={32} />
      </div>
    );

  return (
    <div className="flex h-[calc(100dvh-6rem)] min-h-[28rem] flex-col overflow-hidden rounded-2xl bg-[#8DB0D1] font-sans sm:h-[calc(100dvh-7rem)] lg:h-[calc(100dvh-8rem)]">
      <header className="z-30 flex items-center gap-3 border-b border-slate-200 bg-white px-3 py-2.5 text-slate-800 shadow-sm sm:px-5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard/support")}
          aria-label="Back to support tickets"
          className="shrink-0 rounded-full text-slate-600 hover:bg-slate-100"
        >
          <FiArrowLeft size={20} />
        </Button>
        <div className="min-w-0">
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
            <span
              className={`h-2 w-2 rounded-full ${
                ticket?.status === "OPEN" ? "bg-emerald-500" : "bg-slate-400"
              }`}
            />
            {ticket?.status === "OPEN"
              ? "Support is active"
              : "Support is unavailable"}
          </p>
        </div>
      </header>

      {/* --- Chat Workspace --- */}
      <main className="flex-1 overflow-hidden flex flex-col relative bg-[#E7EBF0]">
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none bg-[url('https://edgetelegram.com/wp-content/uploads/2021/05/telegram-background-pattern.png')] bg-repeat" />

        <div
          ref={scrollRef}
          className="relative z-10 flex-1 space-y-2 overflow-y-auto px-4 py-4 sm:px-6 lg:px-8 scroll-smooth"
        >
          <div className="flex justify-center mb-6">
            <span className="bg-black/10 backdrop-blur-md px-4 py-1 rounded-full text-[11px] font-bold text-white uppercase tracking-wider">
              {new Date(ticket?.createdAt).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          {ticket?.messages?.map((msg, index) => {
            const isUser =
              String(msg.sender?._id || msg.sender) ===
              String(ticket.user?._id || ticket.user);
            return (
              <div
                key={index}
                className={`flex w-full ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`relative max-w-[85%] px-3 py-1.5 shadow-sm transition-all animate-in fade-in slide-in-from-bottom-1 duration-300 ${
                    isUser
                      ? "bg-blue-100 text-slate-800 rounded-2xl rounded-tr-none"
                      : "bg-white text-slate-800 rounded-2xl rounded-tl-none"
                  }`}
                >
                  <p className="text-[14.5px] leading-snug pr-10 whitespace-pre-wrap">
                    {msg.message}
                  </p>
                  <div className="absolute bottom-1 right-2 flex items-center gap-1 opacity-40">
                    <span className="text-[9px] font-bold">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </span>
                    {isUser && (
                      <div className="flex -space-x-1.5">
                        <FiCheck size={12} />
                        <FiCheck size={12} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* --- Telegram Style Input Footer --- */}
        <footer className="relative z-40 bg-[#E7EBF0] p-2 sm:px-4 lg:px-6">
          {showEmoji && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-20 left-4 z-50 shadow-2xl"
            >
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                width={300}
                height={400}
              />
            </div>
          )}

          {ticket?.status === "CLOSED" ? (
            <div className="bg-white/50 backdrop-blur-sm p-3 rounded-xl text-center border border-slate-200 mb-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Conversation Closed
              </p>
            </div>
          ) : (
            <div className="flex items-end gap-2">
              {/* Main Input Wrapper */}
              <div className="flex-1 bg-white rounded-[22px] shadow-sm border border-slate-200 flex items-end min-h-[44px]">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowEmoji(!showEmoji)}
                  className="text-slate-400 rounded-full h-11 w-11 shrink-0 hover:bg-transparent hover:text-[#517DA2]"
                >
                  <Smile size={24} />
                </Button>
                <textarea
                  rows={1}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message"
                  className="flex-1 bg-transparent border-none outline-none ring-0 focus:ring-0 focus:outline-none focus-visible:ring-0 py-2.5 px-1 text-[16px] resize-none overflow-y-auto max-h-48 leading-tight shadow-none focus-visible:ring-offset-0"
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                  }}
                />

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 rounded-full h-11 w-11 shrink-0 hover:bg-transparent"
                >
                  <Paperclip size={22} className="-rotate-45" />
                </Button>
              </div>

              {/* Telegram Circular Send Button */}
              <button
                onClick={handleSendReply}
                disabled={isReplying || !reply.trim()}
                className={`h-11 w-11 rounded-full flex items-center justify-center transition-all shadow-sm shrink-0 outline-none ${
                  reply.trim()
                    ? "bg-[#517DA2] text-white rotate-0 scale-100"
                    : "bg-white text-[#517DA2] scale-95 opacity-50"
                }`}
              >
                {isReplying ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <FiSend size={20} className="ml-0.5" />
                )}
              </button>
            </div>
          )}
          <div className="h-1 md:h-4" />
        </footer>
      </main>
    </div>
  );
};

export default TicketDetailPage;
