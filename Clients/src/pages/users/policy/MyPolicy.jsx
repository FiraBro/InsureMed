import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  FiX,
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
  const [debouncedSearch, setDebouncedSearch] = useState(""); // Fix 1: Added Debounce state
  const [page, setPage] = useState(1);
  const [renewalTarget, setRenewalTarget] = useState(null);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Fix 2: Implement Debounce effect to prevent flickering/empty results while typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400); // Wait 400ms after user stops typing
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fix 3: Use debouncedSearch for the hook
  const { data, isLoading, isFetching, refetch } = useMyPolicies({
    page,
    search: debouncedSearch,
    limit: 10,
  });

  // Fix 4: Updated selectors to match your specific API response: { data: { applications: [...] } }
  const policies = data?.data?.applications || [];
  const meta = data?.data?.pagination || {
    total: data?.results || policies.length,
    totalPages: Math.ceil((data?.results || 0) / 10) || 1,
  };

  // Reset to page 1 ONLY when debounced search actually changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  if (!isAuthenticated)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <FiShield className="w-12 h-12 text-zinc-200" />
        <p className="font-bold text-zinc-400 uppercase tracking-widest text-xs">
          Access Denied: Please Login
        </p>
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
            Policies
          </h1>
          <p className="text-zinc-500 text-sm">
            Manage and renew your active protections
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <FiSearch
              className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                isFetching ? "text-blue-500" : "text-zinc-400"
              }`}
            />
            <Input
              placeholder="Search by plan name or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-100 border-none rounded-2xl h-11 focus-visible:ring-zinc-200"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="rounded-2xl border-zinc-200 h-11 w-11 p-0 shadow-sm bg-white"
          >
            <FiRefreshCw className={isFetching ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      <Card className="rounded-[2.5rem] border-zinc-100 shadow-xl shadow-zinc-100/50 overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-zinc-50/50">
            <TableRow className="hover:bg-transparent border-zinc-100">
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-400 py-6 pl-8">
                Policy
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Premium
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Status
              </TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-zinc-400 pr-8">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton rows={5} />
            ) : policies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-zinc-400">
                    <FiSearch className="w-8 h-8 mb-2 opacity-20" />
                    <p className="font-medium">
                      No policies found matching "{debouncedSearch}"
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <AnimatePresence mode="wait">
                {policies.map((policy) => (
                  <TableRow
                    key={policy._id}
                    className="border-zinc-50 hover:bg-zinc-50/30 transition-colors"
                  >
                    <TableCell className="pl-8 py-5">
                      <div className="font-bold text-zinc-900">
                        {policy.planId?.name}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono uppercase tracking-tighter">
                        ID: {policy._id.slice(-8)} • Exp:{" "}
                        {new Date(policy.endDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-zinc-900">
                        ${policy.planId?.premium}
                      </div>
                      <div className="text-[10px] text-zinc-500 uppercase">
                        {policy.planId?.premiumFrequency || "monthly"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-50 text-emerald-700 border-none shadow-none text-[10px] font-bold uppercase tracking-wider px-3">
                        {policy.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <Button
                        onClick={() => setRenewalTarget(policy)}
                        className="bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest px-6 h-9 hover:bg-blue-400 shadow-lg shadow-zinc-200 active:scale-95 transition-all"
                      >
                        Renew
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </AnimatePresence>
            )}
          </TableBody>
        </Table>

        <div className="p-6 border-t border-zinc-100 flex justify-between items-center bg-zinc-50/20">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
            {meta.total || 0} Records Total
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={page === 1 || isLoading}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-xl h-10 w-10 p-0 border-zinc-200 bg-white"
            >
              <FiChevronLeft />
            </Button>
            <Button
              variant="outline"
              disabled={page >= (meta.totalPages || 1) || isLoading}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl h-10 w-10 p-0 border-zinc-200 bg-white"
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

// ... RenewalModal and TableSkeleton remain the same ...

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
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-[2.5rem] border-none bg-white shadow-2xl">
        <div className="p-8 space-y-6">
          <DialogHeader className="flex flex-row justify-between items-start">
            <div className="space-y-1">
              <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2">
                Secure Renewal
              </div>
              <DialogTitle className="text-2xl font-black text-zinc-900 tracking-tight">
                {policy.planId?.name}
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-5 bg-zinc-50 rounded-[1.5rem] border border-zinc-100 space-y-3">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Bank Details
              </p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Account Name</span>
                  <span className="font-bold text-zinc-900">
                    Secure Insure Ltd.
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Account #</span>
                  <span className="font-mono font-bold text-zinc-900">
                    100012345678
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-zinc-200/50">
                  <span className="text-zinc-400 font-bold">Total Amount</span>
                  <span className="text-lg font-black text-zinc-900">
                    ${policy.planId?.premium}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative group">
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={(e) => setFile(e.target.files[0])}
                accept="image/*,application/pdf"
              />
              <div
                className={`p-8 border-2 border-dashed rounded-[1.5rem] flex flex-col items-center justify-center transition-all ${
                  file
                    ? "border-emerald-200 bg-emerald-50/30"
                    : "border-zinc-100 group-hover:bg-zinc-50"
                }`}
              >
                {file ? (
                  <div className="text-center">
                    <FiCheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs font-bold text-emerald-700 truncate max-w-[200px]">
                      {file.name}
                    </p>
                  </div>
                ) : (
                  <>
                    <FiUploadCloud className="text-zinc-300 w-8 h-8 mb-2" />
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">
                      Upload Transfer Receipt
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleUpload}
              disabled={!file || mutation.isPending}
              className="w-full h-14 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-zinc-200 active:scale-95 transition-all disabled:opacity-50"
            >
              {mutation.isPending ? "Processing..." : "Submit Verification"}
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:bg-transparent"
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
    <TableRow key={i}>
      <TableCell className="pl-8 py-5">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-3 w-48" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-20 rounded-full" />
      </TableCell>
      <TableCell className="text-right pr-8">
        <Skeleton className="h-9 w-24 ml-auto rounded-xl" />
      </TableCell>
    </TableRow>
  ));
}
