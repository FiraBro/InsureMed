import { useState, useDeferredValue, useEffect, memo } from "react";
import { useClaims } from "@/hooks/useClaim";
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
import EditClaimModal from "@/components/modal/EditClaimModal";

/* ---------------- UI Helpers ---------------- */

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount || 0);

const getStatusStyles = (status) => {
  const s = status?.toLowerCase();
  switch (s) {
    case "approved":
      return "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-50";
    case "pending":
      return "bg-zinc-100 text-zinc-500 border-zinc-200";
    case "rejected":
      return "bg-rose-50 text-rose-600 border-rose-100";
    default:
      return "bg-gray-50 text-gray-400";
  }
};

/* ---------------- MEMOIZED ROW ---------------- */
const ClaimRow = memo(({ claim, onSelect, onStatusUpdate, isProcessing }) => (
  <TableRow className="hover:bg-blue-50/30 transition-all group border-none">
    <TableCell className="px-8 py-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-lg shadow-zinc-100 font-manrope">
          {claim.user?.fullName?.[0] || <FiUser />}
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-zinc-900 font-manrope text-xs leading-none mb-1.5 uppercase tracking-wide">
            {claim.user?.fullName}
          </span>
          <span className="text-[10px] text-zinc-400 font-medium font-inter lowercase">
            {claim.user?.email}
          </span>
        </div>
      </div>
    </TableCell>

    <TableCell className="px-8 py-5">
      <div className="flex flex-col">
        <span className="font-black text-zinc-700 font-manrope text-[10px] mb-1">
          #{claim._id.slice(-8).toUpperCase()}
        </span>
        <span className="text-[9px] text-blue-600 font-bold uppercase tracking-widest">
          {claim.policyNumber}
        </span>
      </div>
    </TableCell>

    <TableCell className="px-8 py-5 font-bold text-zinc-600 text-[10px] font-inter uppercase">
      {claim.claimType}
    </TableCell>

    <TableCell className="px-8 py-5 font-black text-zinc-900 font-manrope text-xs">
      {formatCurrency(claim.amount)}
    </TableCell>

    <TableCell className="px-8 py-5">
      <Badge
        className={`px-3 py-1 font-black text-[9px] uppercase tracking-wider border-none ${getStatusStyles(
          claim.status
        )}`}
      >
        {claim.status}
      </Badge>
    </TableCell>

    <TableCell className="px-8 py-5 text-right">
      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="icon"
          variant="ghost"
          className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-sm"
          onClick={() => onSelect(claim)}
          disabled={isProcessing}
        >
          <FiEye className="h-4 w-4 text-zinc-500" />
        </Button>
        {claim.status?.toLowerCase() === "pending" && (
          <>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-xl hover:bg-emerald-50 hover:text-emerald-600"
              onClick={() => onStatusUpdate(claim._id, "approved")}
              disabled={isProcessing}
            >
              <FiCheckCircle className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-xl hover:bg-rose-50 hover:text-rose-600"
              onClick={() => onStatusUpdate(claim._id, "rejected")}
              disabled={isProcessing}
            >
              <FiXCircle className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </TableCell>
  </TableRow>
));

export default function AdminClaimsManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [selectedClaim, setSelectedClaim] = useState(null);

  useEffect(() => {
    setPage(1);
  }, [deferredSearch]);

  const { adminClaims, meta, isLoading, isProcessing, updateStatus } =
    useClaims({
      page,
      limit: 10,
      search: deferredSearch,
      isAdmin: true,
    });

  const handleStatusUpdate = async (id, status) => {
    if (!confirm(`Confirm change to ${status.toUpperCase()}?`)) return;
    await updateStatus({ id, status });
  };

  return (
    <div className="p-8 bg-zinc-50/30 min-h-screen max-w-screen-2xl mx-auto font-inter">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight uppercase font-manrope">
            Claims Registry
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
              Network:{" "}
              <span className="text-zinc-900">
                {meta.total.toLocaleString()}
              </span>{" "}
              Nodes Detected
            </p>
          </div>
        </div>

        <div className="relative w-full md:w-[400px] group">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
          <Input
            placeholder="Search Claims..."
            className="pl-12 h-12 bg-white border-zinc-200 focus-visible:ring-blue-600 rounded-2xl shadow-sm text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* --- REGISTRY TABLE --- */}
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
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  ease: "easeInOut",
                }}
                className="h-full w-1/4 bg-blue-600"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <Table>
          <TableHeader className="bg-zinc-50/50">
            <TableRow className="border-b border-zinc-100 hover:bg-transparent">
              <TableHead className="px-8 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest font-manrope">
                Claimant
              </TableHead>
              <TableHead className="px-8 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest font-manrope">
                Reference
              </TableHead>
              <TableHead className="px-8 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest font-manrope">
                Type
              </TableHead>
              <TableHead className="px-8 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest font-manrope">
                Settlement
              </TableHead>
              <TableHead className="px-8 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest font-manrope">
                Status
              </TableHead>
              <TableHead className="px-8 py-6 text-right text-[10px] font-black uppercase text-zinc-400 tracking-widest font-manrope">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-zinc-50">
            {adminClaims.length === 0 && !isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-32 text-center">
                  <FiInbox className="mx-auto text-4xl text-zinc-200 mb-4" />
                  <p className="font-manrope text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                    Registry Empty
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              adminClaims.map((claim) => (
                <ClaimRow
                  key={claim._id}
                  claim={claim}
                  onSelect={setSelectedClaim}
                  onStatusUpdate={handleStatusUpdate}
                  isProcessing={isProcessing}
                />
              ))
            )}
          </TableBody>
        </Table>

        {/* --- BLUE PAGINATION FOOTER --- */}
        <div className="bg-white border-t border-zinc-100 px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              Scope
            </span>
            <div className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-[11px] font-bold shadow-md shadow-blue-100">
              {adminClaims.length} <span className="text-blue-200 mx-1">/</span>{" "}
              {meta.total.toLocaleString()}
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-100/50 p-1 rounded-2xl border border-zinc-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl hover:bg-white disabled:opacity-30"
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
                  className={`h-9 w-9 rounded-xl text-[11px] font-black transition-all ${
                    page === pageNum
                      ? "bg-white text-blue-600 shadow-sm border border-blue-100"
                      : "text-zinc-400 hover:text-blue-600"
                  }`}
                  variant="ghost"
                >
                  {pageNum}
                </Button>
              )
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl hover:bg-white disabled:opacity-30"
              disabled={page === meta.totalPages || isLoading}
              onClick={() => setPage((p) => p + 1)}
            >
              <FiChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em]">
            Index {page} <span className="mx-2 text-zinc-200">|</span>{" "}
            {meta.totalPages}
          </div>
        </div>
      </div>

      {selectedClaim && (
        <EditClaimModal
          claim={selectedClaim}
          open={!!selectedClaim}
          onClose={() => setSelectedClaim(null)}
        />
      )}
    </div>
  );
}
