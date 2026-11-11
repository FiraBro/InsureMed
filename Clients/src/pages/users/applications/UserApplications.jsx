import React, { useState, memo, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import {
  FiFileText,
  FiRefreshCw,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
} from "react-icons/fi";
import { useAuthStore } from "@/stores/authStore";
import { useApplications } from "@/hooks/useApplication";
import UserApplicationDetailModal from "@/components/modal/UserApplicationDetailModal";

const StatusBadge = memo(({ status }) => {
  const s = (status || "pending").toLowerCase();
  const config = {
    approved: {
      label: "Approved",
      class: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: <FiCheckCircle />,
    },
    rejected: {
      label: "Rejected",
      class: "bg-red-50 text-red-700 border-red-200",
      icon: <FiXCircle />,
    },
    pending: {
      label: "Pending",
      class: "bg-amber-50 text-amber-700 border-amber-200",
      icon: <FiClock />,
    },
  };
  const current = config[s] || config.pending;
  return (
    <Badge
      variant="outline"
      className={`${current.class} inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium shadow-none`}
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

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
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
      search: debouncedSearch,
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
      <div className="w-full space-y-6 px-4 py-8 md:px-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  if (!isAuthenticated)
    return (
      <div className="p-20 text-center text-sm font-medium text-slate-500">
        Please login to view history.
      </div>
    );

  const headClass =
    "h-11 text-xs font-semibold uppercase tracking-wider text-slate-500";

  return (
    <div className="min-h-screen w-full space-y-6 px-4 py-8 md:px-8">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Application History
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage and track your active insurance requests.
          </p>
        </div>

        <div className="flex w-full items-center gap-2 md:w-auto">
          <div className="relative flex-1 md:w-72">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search plan or status..."
              aria-label="Search applications"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 border-slate-300 bg-white pl-9 focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600/20"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={actions.refresh}
            disabled={isFetching}
            aria-label="Refresh applications"
            className="h-10 w-10 border-slate-300 bg-white p-0 text-slate-600 hover:bg-slate-50"
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
        <TabsList className="mb-4 h-10 rounded-lg bg-slate-100 p-1">
          {["all", "pending", "approved", "rejected"].map((t) => (
            <TabsTrigger
              key={t}
              value={t}
              className="rounded-md px-5 text-sm capitalize text-slate-600 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
            >
              {t}
              <span className="ml-2 text-xs tabular-nums text-slate-400">
                {counts[t] || 0}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        <Card className="overflow-hidden rounded-xl border-slate-200 bg-white shadow-sm">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="border-slate-200 hover:bg-slate-50">
                <TableHead className={`${headClass} pl-6`}>Plan Name</TableHead>
                <TableHead className={`${headClass} text-center`}>
                  Submitted
                </TableHead>
                <TableHead className={headClass}>Status</TableHead>
                <TableHead className={headClass}>Period</TableHead>
                <TableHead className={`${headClass} pr-6 text-right`}>
                  Details
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apps.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={5}
                    className="h-48 text-center text-sm text-slate-500"
                  >
                    No records found matching "{debouncedSearch}"
                  </TableCell>
                </TableRow>
              ) : (
                apps.map((app) => (
                  <TableRow
                    key={app._id}
                    className="h-16 border-slate-100 transition-colors hover:bg-slate-50"
                  >
                    <TableCell className="pl-6 text-sm font-medium text-slate-900">
                      {app.planId?.name}
                    </TableCell>
                    <TableCell className="text-center text-sm text-slate-600">
                      {formatDate(app.createdAt)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={app.status} />
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {app.status === "approved"
                        ? `${formatDate(app.startDate)} - ${formatDate(
                            app.endDate,
                          )}`
                        : "Pending Approval"}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedApp(app);
                          setDetailModalOpen(true);
                        }}
                        className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <FiFileText className="mr-2" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3">
            <span className="text-sm text-slate-500">
              Page {page} of {meta.totalPages || 1}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                aria-label="Previous page"
                disabled={page === 1 || isFetching}
                onClick={() => setPage((p) => p - 1)}
                className="h-9 w-9 border-slate-300 bg-white p-0"
              >
                <FiChevronLeft />
              </Button>
              <Button
                variant="outline"
                size="sm"
                aria-label="Next page"
                disabled={page >= (meta.totalPages || 1) || isFetching}
                onClick={() => setPage((p) => p + 1)}
                className="h-9 w-9 border-slate-300 bg-white p-0"
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
    </div>
  );
}
