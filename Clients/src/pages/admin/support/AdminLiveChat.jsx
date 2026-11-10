import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTickets } from "@/hooks/useTicket";
import { Button } from "@/components/ui/button";
import { FiArrowLeft, FiSend, FiCheck } from "react-icons/fi";
import { Loader2, Paperclip, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react"; // Remember to install this

const AdminLiveChat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [msgText, setMsgText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const scrollRef = useRef();
  const emojiPickerRef = useRef(null);

  const { ticketDetails, isLoadingDetails, replyToTicket, isReplying } =
    useTickets(id);

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [ticketDetails?.messages]);

  // Handle clicking outside emoji picker
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

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!msgText.trim() || isReplying) return;
    replyToTicket(
      { id, message: msgText, sender: "AGENT" }, // Admin sends as AGENT
      {
        onSuccess: () => {
          setMsgText("");
          setShowEmoji(false);
        },
      }
    );
  };

  const handleKeyDown = (e) => {
    // Desktop: Enter to send, Shift+Enter for new line
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 768) {
      e.preventDefault();
      handleSend();
    }
  };

  const onEmojiClick = (emojiData) => {
    setMsgText((prev) => prev + emojiData.emoji);
  };

  if (isLoadingDetails)
    return (
      <div className="flex h-[calc(100dvh-7rem)] min-h-[28rem] items-center justify-center overflow-hidden rounded-2xl bg-[#8DB0D1]">
        <Loader2 className="animate-spin text-white" size={32} />
      </div>
    );

  return (
    <div className="flex h-[calc(100dvh-7rem)] min-h-[28rem] flex-col overflow-hidden rounded-2xl bg-[#8DB0D1] font-sans">
      <header className="z-30 flex items-center gap-3 border-b border-slate-200 bg-white px-3 py-2.5 text-slate-800 shadow-sm sm:px-5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/support/tickets")}
          aria-label="Back to support tickets"
          className="shrink-0 rounded-full text-slate-600 hover:bg-slate-100"
        >
          <FiArrowLeft size={20} />
        </Button>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold sm:text-base">
            {ticketDetails?.user?.name || "Customer conversation"}
          </h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
            <span
              className={`h-2 w-2 rounded-full ${
                ticketDetails?.status === "OPEN"
                  ? "bg-emerald-500"
                  : "bg-slate-400"
              }`}
            />
            {ticketDetails?.status === "OPEN" ? "Ticket is active" : "Ticket is closed"}
          </p>
        </div>
      </header>

      {/* --- Telegram Chat Area --- */}
      <main className="flex-1 overflow-hidden flex flex-col relative bg-[#E7EBF0]">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[url('https://edgetelegram.com/wp-content/uploads/2021/05/telegram-background-pattern.png')] bg-repeat" />

        <div
          ref={scrollRef}
          className="relative z-10 flex-1 space-y-2 overflow-y-auto px-4 py-4 sm:px-6 lg:px-8 scroll-smooth"
        >
          <div className="mb-6 flex justify-center">
            <span className="rounded-full bg-black/10 px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
              {new Date(ticketDetails?.createdAt).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          {ticketDetails?.messages?.map((m, i) => {
            const ticketOwnerId =
              typeof ticketDetails.user === "object"
                ? ticketDetails.user._id
                : ticketDetails.user;
            const messageSenderId =
              typeof m.sender === "object" ? m.sender._id : m.sender;
            const isMe = String(messageSenderId) !== String(ticketOwnerId);

            return (
              <div
                key={i}
                className={`flex w-full ${
                  isMe ? "justify-end" : "justify-start"
                } animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`relative max-w-[85%] px-3 py-1.5 shadow-sm transition-all ${
                    isMe
                      ? "bg-blue-100 text-slate-800 rounded-2xl rounded-tr-none"
                      : "bg-white text-slate-800 rounded-2xl rounded-tl-sm"
                  }`}
                >
                  <p className="text-[14.5px] leading-snug pr-12 whitespace-pre-wrap">
                    {m.message}
                  </p>
                  <div className="absolute bottom-1 right-2 flex items-center gap-1 opacity-50">
                    <span className="text-[10px] font-medium">
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </span>
                    {isMe && (
                      <div className="flex">
                        <FiCheck size={12} className="-mr-1.5" />
                        <FiCheck size={12} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* --- Telegram Style Admin Input --- */}
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

          <div className="flex items-end gap-2">
            {/* Main Input Wrapper */}
            <div className="flex-1 bg-white rounded-[22px] shadow-sm border border-slate-100 flex items-end min-h-[44px]">
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
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message"
                /* Removed dark focus border with outline-none and focus-visible:ring-0 */
                className="flex-1 bg-transparent border-none outline-none ring-0 focus:ring-0 focus:outline-none focus-visible:ring-0 py-2.5 px-1 text-[16px] resize-none overflow-y-auto max-h-48 leading-tight text-slate-700"
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
              onClick={handleSend}
              disabled={isReplying || !msgText.trim()}
              className={`h-11 w-11 rounded-full flex items-center justify-center transition-all shadow-sm shrink-0 outline-none ${
                msgText.trim()
                  ? "bg-[#517DA2] text-white scale-100"
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
          <div className="h-1 md:h-4" />
        </footer>
      </main>

    </div>
  );
};

export default AdminLiveChat;
