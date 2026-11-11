import { useState, useDeferredValue, useEffect, memo } from "react";
import { useApplications } from "@/hooks/useApplication";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiInbox,
} from "react-icons/fi";
import ApplicationDetailModal from "@/components/modal/ApplicationDetailModal";
import { toast } from "react-toastify";

const getStatusStyles = (status) => {
  const s = status?.toLowerCase();
  if (s === "approved")
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (s === "pending") return "border-amber-200 bg-amber-50 text-amber-700";
  if (s === "rejected") return "border-red-200 bg-red-50 text-red-700";
  return "border-slate-200 bg-slate-50 text-slate-500";
};

const ApplicationRow = memo(
  ({ app, onApprove, onReject, onView, isProcessing }) => (
    <TableRow className="h-16 border-slate-100 transition-colors hover:bg-slate-50">
      <TableCell className="pl-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold uppercase text-blue-700">
            {app.personal?.fullName?.[0] || <FiUser />}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">
              {app.personal?.fullName}
            </p>
            <p className="truncate text-xs text-slate-500">
              {app.personal?.email}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <p className="text-sm font-medium text-slate-900">{app.planId?.name}</p>
        <p className="text-xs text-slate-500">Registry Node</p>
      </TableCell>
      <TableCell className="text-sm text-slate-600">
        {new Date(app.createdAt).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize shadow-none ${getStatusStyles(
            app.status,
          )}`}
        >
          {app.status}
        </Badge>
      </TableCell>
      <TableCell className="pr-6 text-right">
        <div className="flex justify-end gap-1">
          <Button
            size="icon"
            variant="ghost"
            aria-label="View application"
            className="h-9 w-9 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => onView(app)}
            disabled={isProcessing}
          >
            <FiEye className="h-4 w-4" />
          </Button>
          {app.status === "pending" && (
            <>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Approve application"
                className="h-9 w-9 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
                onClick={() => onApprove(app._id)}
                disabled={isProcessing}
              >
                <FiCheckCircle className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Reject application"
                className="h-9 w-9 text-slate-500 hover:bg-red-50 hover:text-red-700"
                onClick={() => onReject(app._id)}
                disabled={isProcessing}
              >
                <FiXCircle className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  ),
);

export default function AdminPolicyApplications() {
  const [selectedApp, setSelectedApp] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const { adminApplications, meta, isLoading, isProcessing, actions, reject } =
    useApplications({
      page,
      limit: 10,
      search: deferredSearch,
      isAdmin: true,
    });

  useEffect(() => setPage(1), [deferredSearch]);

  const handleView = (app) => {
    setSelectedApp(app);
    setModalOpen(true);
  };

  const handleApprove = async (id) => {
    try {
      await actions.approve(id);
      // Only close the modal on success
      setModalOpen(false);
    } catch (err) {
      console.error("Approval error:", err);
    }
  };

  const handleReject = async (id) => {
    const toastId = toast.loading("Rejecting application...");

    try {
      await actions.reject(id);

      toast.success("Application Rejected", {
        id: toastId,
        description: "The applicant will be notified of this decision.",
      });

      setModalOpen(false);
    } catch (err) {
      toast.error("Action Failed", {
        id: toastId,
        description: err.message,
      });
    }
  };

  const headClass =
    "h-11 text-xs font-semibold uppercase tracking-wider text-slate-500";

  return (
    <div className="min-h-screen w-full space-y-6 px-4 py-8 md:px-8">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Registry Queue
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            <span
              className={`h-2 w-2 rounded-full ${
                isProcessing ? "bg-amber-500" : "bg-emerald-500"
              }`}
            />
            Active Nodes:{" "}
            <span className="font-medium text-slate-900">{meta.total}</span>
          </p>
        </div>

        <div className="relative w-full md:w-96">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search Registry..."
            aria-label="Search registry"
            className="h-10 border-slate-300 bg-white pl-9 focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading && (
          <div className="absolute left-0 top-0 z-20 h-0.5 w-full animate-pulse bg-blue-600" />
        )}

        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="border-slate-200 hover:bg-slate-50">
              <TableHead className={`${headClass} pl-6`}>Applicant</TableHead>
              <TableHead className={headClass}>Policy</TableHead>
              <TableHead className={headClass}>Timestamp</TableHead>
              <TableHead className={headClass}>Status</TableHead>
              <TableHead className={`${headClass} pr-6 text-right`}>
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adminApplications.length === 0 && !isLoading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="h-56 text-center">
                  <FiInbox className="mx-auto mb-2 h-7 w-7 text-slate-300" />
                  <p className="text-sm text-slate-500">Empty Registry</p>
                </TableCell>
              </TableRow>
            ) : (
              adminApplications.map((app) => (
                <ApplicationRow
                  key={app._id}
                  app={app}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onView={handleView}
                  isProcessing={isProcessing}
                />
              ))
            )}
          </TableBody>
        </Table>

        {/* Footer */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-3 sm:flex-row">
          <p className="text-sm text-slate-500">
            Scope:{" "}
            <span className="font-medium tabular-nums text-slate-900">
              {adminApplications.length} / {meta.total}
            </span>
          </p>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous page"
              className="h-9 w-9 border-slate-300 bg-white"
              disabled={page === 1 || isLoading}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              <FiChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <Button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  variant="outline"
                  aria-current={page === pageNum ? "page" : undefined}
                  className={`h-9 w-9 p-0 text-sm tabular-nums ${
                    page === pageNum
                      ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
                      : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {pageNum}
                </Button>
              ),
            )}
            <Button
              variant="outline"
              size="icon"
              aria-label="Next page"
              className="h-9 w-9 border-slate-300 bg-white"
              disabled={page === meta.totalPages || isLoading}
              onClick={() => setPage((p) => p + 1)}
            >
              <FiChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <ApplicationDetailModal
        app={selectedApp}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onApprove={handleApprove}
        onReject={reject}
        isProcessing={isProcessing}
      />
    </div>
  );
}
