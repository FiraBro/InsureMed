// NotificationCenter.jsx
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineBell,
  HiOutlineShieldCheck,
  HiOutlineCreditCard,
  HiOutlineDocumentText,
  HiOutlineTrash,
  HiOutlineCheck,
} from "react-icons/hi";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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

// --- Helper: which day bucket a notification belongs to ---
const getDayBucket = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const that = new Date(date);
  that.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today - that) / 86400000);

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return "Earlier";
};

const BUCKET_ORDER = ["Today", "Yesterday", "Earlier"];

// Same colors as before
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

  // Group into Today / Yesterday / Earlier, keeping the original order inside each group
  const groups = useMemo(() => {
    const buckets = { Today: [], Yesterday: [], Earlier: [] };
    displayNotifications.forEach((n) =>
      buckets[getDayBucket(n.createdAt)].push(n),
    );
    return BUCKET_ORDER.filter((label) => buckets[label].length > 0).map(
      (label) => ({ label, items: buckets[label] }),
    );
  }, [displayNotifications]);

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
    <div className="w-full px-4 py-6 sm:px-6 sm:py-10">
      {/* Header */}
      <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
            Notifications
          </h1>
          <p className="mt-2 text-slate-600">
            {unreadCount > 0
              ? `You have ${unreadCount} unread ${
                  unreadCount === 1 ? "notification" : "notifications"
                }.`
              : "You're all caught up."}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAll}
          disabled={unreadCount === 0 || isProcessingAll}
          className="self-start font-semibold md:self-auto"
        >
          {isProcessingAll ? "Updating..." : "Mark all as read"}
        </Button>
      </header>

      {/* Filters */}
      <Tabs
        defaultValue="all"
        className="mb-2 w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="h-auto w-full justify-start gap-6 overflow-x-auto rounded-none border-b border-slate-200 bg-transparent p-0">
          {["all", "unread", "claim", "policy", "payment"].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="rounded-none border-b-2 border-transparent px-1 pb-3 font-semibold capitalize transition-all data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Feed */}
      {isLoading ? (
        <NotificationLoadingSkeleton />
      ) : (
        groups.map((group) => (
          <section key={group.label}>
            <h2 className="mb-1 mt-8 text-sm font-semibold text-slate-500">
              {group.label}
            </h2>

            <ul className="divide-y divide-slate-100 border-t border-slate-100">
              <AnimatePresence mode="popLayout" initial={false}>
                {group.items.map((notif) => {
                  const styles = getTypeStyles(notif.category);
                  return (
                    <motion.li
                      key={notif._id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{
                        opacity: 0,
                        x: -10,
                        transition: { duration: 0.2 },
                      }}
                      className="group relative flex items-start gap-2 py-4 pl-5"
                    >
                      {/* Unread dot in the left margin */}
                      {!notif.isRead && (
                        <span
                          aria-label="Unread"
                          className="absolute left-0 top-[26px] h-2 w-2 rounded-full bg-blue-600"
                        />
                      )}

                      {/* The whole row is the click target */}
                      <button
                        type="button"
                        onClick={() => handleViewDetails(notif)}
                        className="flex min-w-0 flex-1 items-start gap-4 rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                      >
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${styles.bg} ${styles.color}`}
                        >
                          {styles.icon}
                        </span>

                        <span className="block min-w-0 flex-1">
                          <span className="flex items-baseline justify-between gap-4">
                            <span
                              className={`block truncate ${
                                !notif.isRead
                                  ? "font-semibold text-slate-900"
                                  : "font-medium text-slate-600"
                              }`}
                            >
                              {notif.title}
                            </span>
                            <time className="shrink-0 text-xs text-slate-500">
                              {formatRelativeTime(notif.createdAt)}
                            </time>
                          </span>
                          <span
                            className={`mt-0.5 line-clamp-2 block max-w-2xl text-sm leading-relaxed ${
                              !notif.isRead
                                ? "text-slate-600"
                                : "text-slate-500"
                            }`}
                          >
                            {notif.message}
                          </span>
                        </span>
                      </button>

                      {/* Row actions: always visible on touch, shown on hover/focus on desktop */}
                      <div className="flex shrink-0 items-center gap-1 md:opacity-0 md:transition-opacity md:group-focus-within:opacity-100 md:group-hover:opacity-100">
                        {!notif.isRead && (
                          <button
                            type="button"
                            onClick={() => markAsRead(notif._id)}
                            aria-label="Mark as read"
                            title="Mark as read"
                            className="rounded-md p-2 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                          >
                            <HiOutlineCheck size={18} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteNotification(notif._id)}
                          aria-label="Delete notification"
                          title="Delete"
                          className="rounded-md p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                        >
                          <HiOutlineTrash size={18} />
                        </button>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          </section>
        ))
      )}

      {/* Empty State */}
      {!isLoading && displayNotifications.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center py-24 text-center"
        >
          <span className="mb-4 text-4xl text-slate-300">
            <HiOutlineBell />
          </span>
          <h2 className="font-serif text-xl font-semibold text-slate-900">
            All caught up!
          </h2>
          <p className="mt-1 text-slate-500">
            No new updates in this category.
          </p>
        </motion.div>
      )}
    </div>
  );
}

function NotificationLoadingSkeleton() {
  return (
    <div className="mt-8 divide-y divide-slate-100 border-t border-slate-100">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-4 py-4 pl-5">
          <Skeleton className="h-10 w-10 rounded-full bg-slate-100" />
          <div className="flex-1 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-1/3 bg-slate-100" />
              <Skeleton className="h-3 w-12 bg-slate-100" />
            </div>
            <Skeleton className="h-3 w-full max-w-2xl bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
