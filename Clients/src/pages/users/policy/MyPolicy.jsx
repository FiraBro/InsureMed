import React, { useState, useEffect } from "react";
import { usePolicies } from "@/hooks/usePolicy";
import { useAuthStore } from "@/stores/authStore";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FiRefreshCw,
  FiSearch,
  FiUploadCloud,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiShield,
} from "react-icons/fi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MyPolicies() {
  const { useMyPolicies, renewPolicy } = usePolicies();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [renewalTarget, setRenewalTarget] = useState(null);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Debounce search to prevent flickering while typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data, isLoading, isFetching, refetch } = useMyPolicies({
    page,
    search: debouncedSearch,
    limit: 10,
  });

  // API response shape: { data: { applications: [...] } }
  const policies = data?.data?.applications || [];
  const meta = data?.data?.pagination || {
    total: data?.results || policies.length,
    totalPages: Math.ceil((data?.results || 0) / 10) || 1,
  };

  // Reset to page 1 only when debounced search actually changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  if (!isAuthenticated)
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <FiShield className="h-10 w-10 text-slate-300" />
        <p className="text-sm font-medium text-slate-500">
          Access Denied: Please Login
        </p>
      </div>
    );

  const headClass =
    "h-11 text-xs font-semibold uppercase tracking-wider text-slate-500";

  return (
    <div className="w-full space-y-6 px-4 py-8 md:px-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Policies
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage and renew your active protections
          </p>
        </div>
        <div className="flex w-full gap-2 md:w-auto">
          <div className="relative flex-1 md:w-80">
            <FiSearch
              className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                isFetching ? "text-blue-600" : "text-slate-400"
              }`}
            />
            <Input
              placeholder="Search by plan name or status..."
              aria-label="Search policies"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 border-slate-300 bg-white pl-9 focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600/20"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            aria-label="Refresh policies"
            className="h-10 w-10 border-slate-300 bg-white p-0 text-slate-600 hover:bg-slate-50"
          >
            <FiRefreshCw className={isFetching ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden rounded-xl border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="border-slate-200 hover:bg-slate-50">
              <TableHead className={`${headClass} pl-6`}>Policy</TableHead>
              <TableHead className={headClass}>Premium</TableHead>
              <TableHead className={headClass}>Status</TableHead>
              <TableHead className={`${headClass} pr-6 text-right`}>
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton rows={5} />
            ) : policies.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="h-56 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <FiSearch className="mb-2 h-6 w-6 text-slate-300" />
                    <p className="text-sm">
                      No policies found matching "{debouncedSearch}"
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              policies.map((policy) => (
                <TableRow
                  key={policy._id}
                  className="h-16 border-slate-100 transition-colors hover:bg-slate-50"
                >
                  <TableCell className="pl-6">
                    <div className="text-sm font-medium text-slate-900">
                      {policy.planId?.name}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      ID: {policy._id.slice(-8)} • Exp:{" "}
                      {new Date(policy.endDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-semibold tabular-nums text-slate-900">
                      ${policy.planId?.premium}
                    </div>
                    <div className="mt-0.5 text-xs capitalize text-slate-500">
                      {policy.planId?.premiumFrequency || "monthly"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="rounded-full border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium capitalize text-emerald-700 shadow-none hover:bg-emerald-50">
                      {policy.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <Button
                      onClick={() => setRenewalTarget(policy)}
                      className="h-9 bg-blue-600 px-5 text-sm text-white hover:bg-blue-700"
                    >
                      Renew
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3">
          <span className="text-sm text-slate-500">
            {meta.total || 0} Records Total
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              aria-label="Previous page"
              disabled={page === 1 || isLoading}
              onClick={() => setPage((p) => p - 1)}
              className="h-9 w-9 border-slate-300 bg-white p-0"
            >
              <FiChevronLeft />
            </Button>
            <Button
              variant="outline"
              aria-label="Next page"
              disabled={page >= (meta.totalPages || 1) || isLoading}
              onClick={() => setPage((p) => p + 1)}
              className="h-9 w-9 border-slate-300 bg-white p-0"
            >
              <FiChevronRight />
            </Button>
          </div>
        </div>
      </Card>

      <RenewalModal
        policy={renewalTarget}
        open={!!renewalTarget}
        onClose={() => setRenewalTarget(null)}
        mutation={renewPolicy}
      />
    </div>
  );
}

function RenewalModal({ policy, open, onClose, mutation }) {
  const [file, setFile] = useState(null);

  if (!policy) return null;

  const handleUpload = async () => {
    if (!file) return;

    // Logic: In production, upload to cloud storage here first
    const formData = {
      paymentMethod: "bank_transfer",
      receiptUrl: "uploads/bank_slip_mock.png",
      requestedAt: new Date(),
    };

    await mutation.mutateAsync({ id: policy._id, data: formData });
    onClose();
    setFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md overflow-hidden rounded-xl border-slate-200 bg-white p-0 shadow-xl">
        <div className="space-y-6 p-6">
          <DialogHeader className="space-y-1 text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Secure Renewal
            </p>
            <DialogTitle className="text-xl font-semibold tracking-tight text-slate-900">
              {policy.planId?.name}
            </DialogTitle>
          </DialogHeader>

          {/* Bank details */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Bank Details
            </p>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Account Name</dt>
                <dd className="font-medium text-slate-900">
                  Secure Insure Ltd.
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Account #</dt>
                <dd className="font-mono font-medium text-slate-900">
                  100012345678
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                <dt className="font-medium text-slate-700">Total Amount</dt>
                <dd className="text-lg font-semibold tabular-nums text-slate-900">
                  ${policy.planId?.premium}
                </dd>
              </div>
            </dl>
          </div>

          {/* Upload */}
          <label
            className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition-colors focus-within:ring-2 focus-within:ring-blue-600/30 ${
              file
                ? "border-emerald-300 bg-emerald-50"
                : "border-slate-300 bg-white hover:border-blue-600 hover:bg-blue-50"
            }`}
          >
            <input
              type="file"
              className="sr-only"
              onChange={(e) => setFile(e.target.files[0])}
              accept="image/*,application/pdf"
            />
            {file ? (
              <>
                <FiCheckCircle className="mb-2 h-7 w-7 text-emerald-600" />
                <p className="max-w-[240px] truncate text-sm font-medium text-emerald-700">
                  {file.name}
                </p>
              </>
            ) : (
              <>
                <FiUploadCloud className="mb-2 h-7 w-7 text-slate-400" />
                <p className="text-sm font-medium text-slate-600">
                  Upload Transfer Receipt
                </p>
              </>
            )}
          </label>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleUpload}
              disabled={!file || mutation.isPending}
              className="h-11 w-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {mutation.isPending ? "Processing..." : "Submit Verification"}
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="h-10 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              Cancel Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TableSkeleton({ rows }) {
  return [...Array(rows)].map((_, i) => (
    <TableRow key={i} className="h-16">
      <TableCell className="pl-6">
        <Skeleton className="mb-2 h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-20 rounded-full" />
      </TableCell>
      <TableCell className="pr-6 text-right">
        <Skeleton className="ml-auto h-9 w-24 rounded-md" />
      </TableCell>
    </TableRow>
  ));
}
