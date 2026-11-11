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
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "rejected":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-500";
  }
};

/* ---------------- MEMOIZED ROW ---------------- */
const ClaimRow = memo(({ claim, onSelect, onStatusUpdate, isProcessing }) => (
  <TableRow className="h-16 border-slate-100 transition-colors hover:bg-slate-50">
    <TableCell className="pl-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold uppercase text-blue-700">
          {claim.user?.fullName?.[0] || <FiUser />}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">
            {claim.user?.fullName}
          </p>
          <p className="truncate text-xs text-slate-500">{claim.user?.email}</p>
        </div>
      </div>
    </TableCell>

    <TableCell>
      <p className="font-mono text-sm font-medium text-slate-900">
        #{claim._id.slice(-8).toUpperCase()}
      </p>
      <p className="text-xs text-slate-500">{claim.policyNumber}</p>
    </TableCell>

    <TableCell className="text-sm text-slate-600">{claim.claimType}</TableCell>

    <TableCell className="text-sm font-semibold tabular-nums text-slate-900">
      {formatCurrency(claim.amount)}
    </TableCell>

    <TableCell>
      <Badge
        variant="outline"
        className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize shadow-none ${getStatusStyles(
          claim.status,
        )}`}
      >
        {claim.status}
      </Badge>
    </TableCell>

    <TableCell className="pr-6 text-right">
      <div className="flex justify-end gap-1">
        <Button
          size="icon"
          variant="ghost"
          aria-label="View claim"
          className="h-9 w-9 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          onClick={() => onSelect(claim)}
          disabled={isProcessing}
        >
          <FiEye className="h-4 w-4" />
        </Button>
        {claim.status?.toLowerCase() === "pending" && (
          <>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Approve claim"
              className="h-9 w-9 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
              onClick={() => onStatusUpdate(claim._id, "approved")}
              disabled={isProcessing}
            >
              <FiCheckCircle className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Reject claim"
              className="h-9 w-9 text-slate-500 hover:bg-red-50 hover:text-red-700"
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

  const headClass =
    "h-11 text-xs font-semibold uppercase tracking-wider text-slate-500";

  return (
    <div className="min-h-screen w-full space-y-6 px-4 py-8 md:px-8">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Claims Registry
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            <span
              className={`h-2 w-2 rounded-full ${
                isProcessing ? "bg-amber-500" : "bg-emerald-500"
              }`}
            />
            Network:{" "}
            <span className="font-medium text-slate-900">
              {meta.total.toLocaleString()}
            </span>{" "}
            Nodes Detected
          </p>
        </div>

        <div className="relative w-full md:w-96">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search Claims..."
            aria-label="Search claims"
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
              <TableHead className={`${headClass} pl-6`}>Claimant</TableHead>
              <TableHead className={headClass}>Reference</TableHead>
              <TableHead className={headClass}>Type</TableHead>
              <TableHead className={headClass}>Settlement</TableHead>
              <TableHead className={headClass}>Status</TableHead>
              <TableHead className={`${headClass} pr-6 text-right`}>
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {adminClaims.length === 0 && !isLoading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="h-56 text-center">
                  <FiInbox className="mx-auto mb-2 h-7 w-7 text-slate-300" />
                  <p className="text-sm text-slate-500">Registry Empty</p>
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

        {/* Footer */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-3 sm:flex-row">
          <p className="text-sm text-slate-500">
            Scope:{" "}
            <span className="font-medium tabular-nums text-slate-900">
              {adminClaims.length} / {meta.total.toLocaleString()}
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
