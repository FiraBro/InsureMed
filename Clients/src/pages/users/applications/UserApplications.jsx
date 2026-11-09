import React, { useState, memo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input"; // Added
import {
  FiFileText,
  FiRefreshCw,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiChevronLeft,
  FiChevronRight,
  FiSearch, // Added
} from "react-icons/fi";
import { useAuthStore } from "@/stores/authStore";
import { useApplications } from "@/hooks/useApplication";
import UserApplicationDetailModal from "@/components/modal/UserApplicationDetailModal";

const tableVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

const StatusBadge = memo(({ status }) => {
  const s = (status || "pending").toLowerCase();
  const config = {
    approved: {
      label: "Approved",
      class: "bg-green-50 text-green-700 border-green-200",
      icon: <FiCheckCircle />,
    },
    rejected: {
      label: "Rejected",
      class: "bg-red-50 text-red-700 border-red-200",
      icon: <FiXCircle />,
    },
    pending: {
      label: "Pending",
      class: "bg-yellow-50 text-yellow-700 border-yellow-200",
      icon: <FiClock />,
    },
  };
  const current = config[s] || config.pending;
  return (
    <Badge
      variant="outline"
      className={`${current.class} flex items-center gap-1.5 font-medium shadow-none`}
    >
      {current.icon} {current.label}
    </Badge>
  );
});

export default function UserApplicationsTable() {
  const [selectedApp, setSelectedApp] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const { authReady, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);

  // Added Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce Logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { apps, counts, meta, isLoading, isFetching, actions } =
    useApplications({
      status: activeTab === "all" ? "" : activeTab,
      page,
      limit: 10,
      search: debouncedSearch, // Integrated
    });

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—";

  if (!authReady || isLoading)
    return (
      <div className="p-8">
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  if (!isAuthenticated)
    return (
      <div className="p-20 text-center font-medium text-zinc-500">
        Please login to view history.
      </div>
    );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="p-6 max-w-7xl mx-auto min-h-screen space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
            Application History
          </h1>
          <p className="text-zinc-500 text-sm">
            Manage and track your active insurance requests.
          </p>
        </div>

        {/* Search Bar Integration */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Search plan or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-100/80 border-none rounded-xl h-10 focus-visible:ring-zinc-200"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={actions.refresh}
            disabled={isFetching}
            className="rounded-xl border-zinc-200 h-10 active:scale-95 transition-all"
          >
            <FiRefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val);
          setPage(1);
        }}
      >
        <TabsList className="bg-zinc-100/80 p-1 rounded-xl mb-4">
          {["all", "pending", "approved", "rejected"].map((t) => (
            <TabsTrigger
              key={t}
              value={t}
              className="capitalize px-6 rounded-lg data-[state=active]:shadow-sm"
            >
              {t}{" "}
              <span className="ml-2 opacity-40 text-[10px]">
                {counts[t] || 0}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        <Card className="border-zinc-200 shadow-none rounded-2xl overflow-hidden bg-white">
          <Table>
            <TableHeader className="bg-zinc-50/50">
              <TableRow className="border-b border-gray-200">
                <TableHead className="text-zinc-400 uppercase text-[10px] font-black tracking-widest pl-6">
                  Plan Name
                </TableHead>
                <TableHead className="text-zinc-400 uppercase text-[10px] font-black tracking-widest text-center">
                  Submitted
                </TableHead>
                <TableHead className="text-zinc-400 uppercase text-[10px] font-black tracking-widest">
                  Status
                </TableHead>
                <TableHead className="text-zinc-400 uppercase text-[10px] font-black tracking-widest">
                  Period
                </TableHead>
                <TableHead className="text-right text-zinc-400 uppercase text-[10px] font-black tracking-widest pr-6">
                  Details
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apps.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-48 text-center text-zinc-400"
                  >
                    No records found matching "{debouncedSearch}"
                  </TableCell>
                </TableRow>
              ) : (
                <AnimatePresence mode="wait">
                  {apps.map((app) => (
                    <motion.tr
                      key={app._id}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="hover:bg-zinc-50/50 transition-colors border-b border-zinc-100 last:border-0"
                    >
                      <TableCell className="font-bold text-zinc-900 py-5 pl-6">
                        {app.planId?.name}
                      </TableCell>
                      <TableCell className="text-zinc-500 text-xs text-center">
                        {formatDate(app.createdAt)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={app.status} />
                      </TableCell>
                      <TableCell className="text-zinc-400 text-xs italic">
                        {app.status === "approved"
                          ? `${formatDate(app.startDate)} - ${formatDate(
                              app.endDate
                            )}`
                          : "Pending Approval"}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedApp(app);
                            setDetailModalOpen(true);
                          }}
                          className="text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <FiFileText className="mr-2" /> View
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/30">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Page {page} of {meta.totalPages || 1}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1 || isFetching}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg px-2 border-zinc-200"
              >
                <FiChevronLeft />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= (meta.totalPages || 1) || isFetching}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg px-2 border-zinc-200"
              >
                <FiChevronRight />
              </Button>
            </div>
          </div>
        </Card>
      </Tabs>

      <UserApplicationDetailModal
        app={selectedApp}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />
    </motion.div>
  );
}
