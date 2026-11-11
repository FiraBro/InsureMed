import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTickets } from "@/hooks/useTicket";
import { Button } from "@/components/ui/button";
import { FiArrowLeft, FiSend } from "react-icons/fi";
import { Loader2, Smile } from "lucide-react";
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
      },
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

  // Fills the area beside the sidebar and below the topbar.
  // 7rem = topbar + page padding in your layout (same value as the original).
  const shell =
    "flex h-[calc(100dvh-7rem)] min-h-[28rem] w-full flex-col overflow-hidden bg-white";

  if (isLoadingDetails)
    return (
      <div className={`${shell} items-center justify-center`}>
        <Loader2 className="animate-spin text-blue-600" size={28} />
      </div>
    );

  return (
    <div className={shell}>
      {/* Header: back button only */}
      <header className="z-30 flex shrink-0 items-center border-b border-slate-200 bg-white px-2 py-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/support/tickets")}
          aria-label="Back to support tickets"
          className="h-8 w-8 shrink-0 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          <FiArrowLeft size={18} />
        </Button>
      </header>

      {/* Messages */}
      <main className="flex min-h-0 flex-1 flex-col bg-slate-50">
        <div
          ref={scrollRef}
          className="flex-1 space-y-3 overflow-y-auto scroll-smooth px-4 py-5 sm:px-6"
        >
          <div className="mb-4 flex justify-center">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">
              {new Date(ticketDetails?.createdAt).toLocaleDateString(
                undefined,
                {
                  month: "long",
                  day: "numeric",
                },
              )}
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
                }`}
              >
                <div
                  className={`max-w-[80%] ${isMe ? "items-end" : "items-start"} flex flex-col`}
                >
                  <div
                    className={`px-4 py-2.5 text-sm leading-relaxed ${
                      isMe
                        ? "rounded-2xl rounded-br-sm bg-blue-600 text-white"
                        : "rounded-2xl rounded-bl-sm border border-slate-200 bg-white text-slate-800"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.message}</p>
                  </div>
                  <span className="mt-1 px-1 text-xs tabular-nums text-slate-400">
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <footer className="relative shrink-0 border-t border-slate-200 bg-white p-3 sm:px-4">
          {showEmoji && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-full left-4 z-50 mb-2 shadow-xl"
            >
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                width={300}
                height={400}
              />
            </div>
          )}

          <div className="flex items-end gap-2">
            <div className="flex min-h-[44px] flex-1 items-end rounded-xl border border-slate-300 bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/15">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowEmoji(!showEmoji)}
                aria-label="Insert emoji"
                className="h-11 w-11 shrink-0 text-slate-400 hover:bg-transparent hover:text-blue-600"
              >
                <Smile size={22} />
              </Button>

              <textarea
                rows={1}
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message"
                aria-label="Message"
                className="max-h-48 flex-1 resize-none overflow-y-auto border-none bg-transparent px-1 py-3 text-base leading-tight text-slate-800 outline-none ring-0 placeholder:text-slate-400 focus:outline-none focus:ring-0 focus-visible:ring-0 sm:text-sm"
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
              />
            </div>

            <button
              type="button"
              onClick={handleSend}
              disabled={isReplying || !msgText.trim()}
              aria-label="Send message"
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 ${
                msgText.trim() && !isReplying
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {isReplying ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <FiSend size={18} />
              )}
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default AdminLiveChat;
