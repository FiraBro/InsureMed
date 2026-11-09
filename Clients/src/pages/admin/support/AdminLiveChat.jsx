import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTickets } from "@/hooks/useTicket";
import { Button } from "@/components/ui/button";
import { FiArrowLeft, FiSend, FiMoreVertical, FiCheck } from "react-icons/fi";
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
      <div className="h-screen flex items-center justify-center bg-[#8DB0D1]">
        <Loader2 className="animate-spin text-white" size={32} />
      </div>
    );

  return (
    <div className="h-screen flex flex-col bg-[#8DB0D1] font-sans overflow-hidden">
      {/* --- Telegram Header --- */}
      <header className="bg-[#517DA2] text-white px-4 py-2 flex items-center justify-between shadow-md z-30">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-black/10 rounded-full"
          >
            <FiArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="h-10 w-10 rounded-full bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center font-bold text-lg shadow-inner text-white">
              {ticketDetails?.user?.name?.charAt(0) || "C"}
            </div>
            <div>
              <h2 className="font-bold text-[16px] leading-tight">
                {ticketDetails?.user?.name || "Customer"}
              </h2>
              <p className="text-[12px] text-blue-100 opacity-80">
                {ticketDetails?.status === "OPEN"
                  ? "online"
                  : "last seen recently"}
              </p>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-white rounded-full">
          <FiMoreVertical size={20} />
        </Button>
      </header>

      {/* --- Telegram Chat Area --- */}
      <main className="flex-1 overflow-hidden flex flex-col relative bg-[#E7EBF0]">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[url('https://edgetelegram.com/wp-content/uploads/2021/05/telegram-background-pattern.png')] bg-repeat" />

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:px-[20%] lg:px-[30%] space-y-2 relative z-10 custom-scrollbar scroll-smooth"
        >
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
                      ? "bg-[#EFFDDE] text-slate-800 rounded-2xl rounded-tr-sm"
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
        <footer className="p-2 md:px-[20%] lg:px-[30%] bg-[#E7EBF0] relative z-40">
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

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default AdminLiveChat;
