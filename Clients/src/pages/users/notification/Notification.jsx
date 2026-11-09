import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineBell,
  HiOutlineShieldCheck,
  HiOutlineCreditCard,
  HiOutlineDocumentText,
  HiOutlineTrash,
} from "react-icons/hi";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications } from "@/hooks/useNoitification";

// --- Helper: Relative Time Formatter ---
const formatRelativeTime = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return new Date(date).toLocaleDateString();
};

const getTypeStyles = (category) => {
  const styles = {
    claim: {
      icon: <HiOutlineShieldCheck />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    payment: {
      icon: <HiOutlineCreditCard />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    policy: {
      icon: <HiOutlineDocumentText />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    default: {
      icon: <HiOutlineBell />,
      color: "text-slate-600",
      bg: "bg-slate-50",
    },
  };
  return styles[category] || styles.default;
};

export default function NotificationCenter() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [isProcessingAll, setIsProcessingAll] = useState(false);

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllRead,
    deleteNotification,
  } = useNotifications({
    category:
      activeTab === "all" || activeTab === "unread" ? undefined : activeTab,
  });

  const displayNotifications =
    activeTab === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const handleViewDetails = async (notif) => {
    if (!notif.isRead) await markAsRead(notif._id);

    const routes = {
      claim: `/dashboard/claims/${notif.metadata?.id}`,
      policy: `/dashboard/policies/${notif.metadata?.id}`,
      payment: `/dashboard/billing/${notif.metadata?.id}`,
    };

    if (routes[notif.category]) navigate(routes[notif.category]);
  };

  const handleMarkAll = async () => {
    setIsProcessingAll(true);
    await markAllRead();
    setIsProcessingAll(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Notifications
              {unreadCount > 0 && (
                <Badge
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700 animate-in fade-in zoom-in duration-300"
                >
                  {unreadCount} New
                </Badge>
              )}
            </h1>
            <p className="text-slate-500 mt-1">
              Stay updated with your account activity.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAll}
            disabled={unreadCount === 0 || isProcessingAll}
            className="font-semibold"
          >
            {isProcessingAll ? "Updating..." : "Mark all as read"}
          </Button>
        </header>

        {/* Filters */}
        <Tabs
          defaultValue="all"
          className="w-full mb-6"
          onValueChange={setActiveTab}
        >
          <TabsList className="bg-transparent border-b border-slate-200 w-full justify-start rounded-none h-auto p-0 gap-6">
            {["all", "unread", "claim", "policy", "payment"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="capitalize data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 border-b-2 border-transparent rounded-none pb-3 px-1 font-bold transition-all"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* List Content */}
        <div className="space-y-4">
          {isLoading ? (
            <NotificationLoadingSkeleton />
          ) : (
            <AnimatePresence mode="popLayout" initial={false}>
              {displayNotifications.map((notif) => {
                const styles = getTypeStyles(notif.category);
                return (
                  <motion.div
                    key={notif._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10, transition: { duration: 0.2 } }}
                    className={`group flex gap-4 p-5 rounded-2xl border transition-all ${
                      !notif.isRead
                        ? "bg-white border-blue-100 shadow-sm"
                        : "bg-slate-50/60 border-transparent opacity-75 hover:opacity-100"
                    }`}
                  >
                    {/* Unread Dot */}
                    {!notif.isRead && (
                      <div
                        className="w-2 h-2 bg-blue-600 rounded-full mt-5 shrink-0"
                        aria-hidden="true"
                      />
                    )}

                    <div
                      className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl ${styles.bg} ${styles.color}`}
                    >
                      {styles.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div
                          className="cursor-pointer"
                          onClick={() => handleViewDetails(notif)}
                        >
                          <h3
                            className={`font-bold truncate ${!notif.isRead ? "text-slate-900" : "text-slate-600"}`}
                          >
                            {notif.title}
                          </h3>
                          <p className="text-slate-500 text-sm mt-0.5 line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>
                        </div>
                        <time className="text-[11px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap pt-1">
                          {formatRelativeTime(notif.createdAt)}
                        </time>
                      </div>

                      <div className="mt-4 flex items-center gap-3">
                        <Button
                          onClick={() => handleViewDetails(notif)}
                          variant="secondary"
                          size="sm"
                          className="h-8 px-4 text-xs font-bold rounded-lg bg-white border border-slate-200 hover:bg-slate-50 shadow-sm"
                        >
                          View Details
                        </Button>
                        {!notif.isRead && (
                          <button
                            onClick={() => markAsRead(notif._id)}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => deleteNotification(notif._id)}
                      aria-label="Delete notification"
                      className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all p-1 self-start"
                    >
                      <HiOutlineTrash size={18} />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}

          {/* Empty State */}
          {!isLoading && displayNotifications.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 text-2xl">
                <HiOutlineBell />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                All caught up!
              </h3>
              <p className="text-slate-500">No new updates in this category.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function NotificationLoadingSkeleton() {
  return [1, 2, 3].map((i) => (
    <div
      key={i}
      className="flex gap-4 p-5 rounded-2xl border border-slate-100 bg-white"
    >
      <Skeleton className="w-12 h-12 rounded-xl bg-slate-100" />
      <div className="flex-1 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-1/3 bg-slate-100" />
          <Skeleton className="h-3 w-12 bg-slate-100" />
        </div>
        <Skeleton className="h-3 w-full bg-slate-50" />
      </div>
    </div>
  ));
}
