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
import { motion, AnimatePresence } from "framer-motion";
import ApplicationDetailModal from "@/components/modal/ApplicationDetailModal";
import { toast } from "react-toastify";

const getStatusStyles = (status) => {
  const s = status?.toLowerCase();
  if (s === "approved")
    return "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-50";
  if (s === "pending") return "bg-zinc-100 text-zinc-500 border-zinc-200";
  if (s === "rejected") return "bg-rose-50 text-rose-600 border-rose-100";
  return "bg-gray-50 text-gray-400";
};

const ApplicationRow = memo(
  ({ app, onApprove, onReject, onView, isProcessing }) => (
    <TableRow className="hover:bg-blue-50/30 transition-all group border-none">
      <TableCell className="px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-lg">
            {app.personal?.fullName?.[0] || <FiUser />}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-zinc-900 text-xs uppercase tracking-wide">
              {app.personal?.fullName}
            </span>
            <span className="text-[10px] text-zinc-400 lowercase">
              {app.personal?.email}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell className="px-8 py-5">
        <div className="flex flex-col">
          <span className="font-black text-zinc-600 text-[10px] mb-1">
            {app.planId?.name}
          </span>
          <span className="text-[9px] text-blue-600 font-bold uppercase tracking-widest">
            Registry Node
          </span>
        </div>
      </TableCell>
      <TableCell className="px-8 py-5 font-bold text-zinc-500 text-[10px] uppercase">
        {new Date(app.createdAt).toLocaleDateString()}
      </TableCell>
      <TableCell className="px-8 py-5">
        <Badge
          className={`px-3 py-1 font-black text-[9px] uppercase tracking-wider border-none ${getStatusStyles(
            app.status
          )}`}
        >
          {app.status}
        </Badge>
      </TableCell>
      <TableCell className="px-8 py-5 text-right">
        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-xl hover:bg-white shadow-sm"
            onClick={() => onView(app)} // 👈 This opens the modal
            disabled={isProcessing}
          >
            <FiEye className="h-4 w-4 text-zinc-500" />
          </Button>
          {app.status === "pending" && (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 rounded-xl hover:text-emerald-600"
                onClick={() => onApprove(app._id)}
                disabled={isProcessing}
              >
                <FiCheckCircle className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 rounded-xl hover:text-rose-600"
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
  )
);

export default function AdminPolicyApplications() {
  const [selectedApp, setSelectedApp] = useState(null); // Track the app for the modal
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
  console.log("policy application:", adminApplications);

  useEffect(() => setPage(1), [deferredSearch]);

  const handleView = (app) => {
    setSelectedApp(app);
    setModalOpen(true);
  };

  const handleApprove = async (id) => {
    // We don't need a toastId here if the hook handles it
    try {
      await actions.approve(id);
      // Only close the modal on success
      setModalOpen(false);
    } catch (err) {
      // React Query usually handles the global error toast,
      // but you can keep a console log for debugging
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

  return (
    <div className="p-8 bg-zinc-50/30 min-h-screen max-w-screen-2xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight uppercase">
            Registry Queue
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`h-2 w-2 rounded-full ${
                isProcessing
                  ? "bg-amber-500 animate-spin"
                  : "bg-blue-600 animate-pulse"
              }`}
            />
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em]">
              Active Nodes: <span className="text-zinc-900">{meta.total}</span>
            </p>
          </div>
        </div>

        <div className="relative w-full md:w-[400px]">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Search Registry..."
            className="pl-12 h-12 bg-white border-zinc-200 rounded-2xl shadow-sm text-sm focus-visible:ring-blue-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="border border-zinc-200 rounded-[2.5rem] overflow-hidden shadow-sm bg-white relative">
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-0 left-0 w-full h-[3px] bg-zinc-100 overflow-hidden z-20"
            >
              <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="h-full w-1/4 bg-blue-600"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <Table>
          <TableHeader className="bg-zinc-50/50">
            <TableRow className="border-b border-zinc-100">
              <TableHead className="px-8 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                Applicant
              </TableHead>
              <TableHead className="px-8 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                Policy
              </TableHead>
              <TableHead className="px-8 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                Timestamp
              </TableHead>
              <TableHead className="px-8 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                Status
              </TableHead>
              <TableHead className="px-8 py-6 text-right text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-zinc-50">
            {adminApplications.length === 0 && !isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-32 text-center text-zinc-300 uppercase text-[10px] font-bold"
                >
                  <FiInbox className="mx-auto text-4xl mb-4" />
                  Empty Registry
                </TableCell>
              </TableRow>
            ) : (
              adminApplications.map((app) => (
                <ApplicationRow
                  key={app._id}
                  app={app}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onView={handleView} // 👈 Pass the new function here
                  isProcessing={isProcessing}
                />
              ))
            )}
          </TableBody>
        </Table>

        <div className="bg-white border-t border-zinc-100 px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              Scope
            </span>
            <div className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-[11px] font-bold shadow-md shadow-blue-100">
              {adminApplications.length}{" "}
              <span className="text-blue-200 mx-1">/</span> {meta.total}
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-100/50 p-1 rounded-2xl border border-zinc-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl disabled:opacity-30"
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
                  variant="ghost"
                  className={`h-9 w-9 rounded-xl text-[11px] font-black ${
                    page === pageNum
                      ? "bg-white text-blue-600 shadow-sm border border-blue-100"
                      : "text-zinc-400 hover:text-blue-600"
                  }`}
                >
                  {pageNum}
                </Button>
              )
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl disabled:opacity-30"
              disabled={page === meta.totalPages || isLoading}
              onClick={() => setPage((p) => p + 1)}
            >
              <FiChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em]">
            Index {page} <span className="mx-2">|</span> {meta.totalPages}
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
