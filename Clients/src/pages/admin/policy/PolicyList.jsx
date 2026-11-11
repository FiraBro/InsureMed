import React, { useState, useDeferredValue, useEffect, memo } from "react";
import { usePolicies } from "@/hooks/usePolicy";
import {
  FiRefreshCw,
  FiSearch,
  FiInbox,
  FiChevronLeft,
  FiChevronRight,
  FiLoader,
  FiUser,
} from "react-icons/fi";

// UI Components
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AdminPolicyActions from "@/components/modal/PolicyActions";
import { toast } from "react-toastify";

/* ---------------- UI HELPERS ---------------- */

const getStatusStyles = (status) => {
  const s = status?.toLowerCase();
  switch (s) {
    case "active":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "expired":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-500";
  }
};

/* ---------------- MEMOIZED ROW ---------------- */
const PolicyRow = memo(({ policy, isSelected, onToggle }) => (
  <TableRow
    className={`h-16 border-slate-100 transition-colors hover:bg-slate-50 ${
      isSelected ? "bg-blue-50/60 hover:bg-blue-50/60" : ""
    }`}
  >
    <TableCell className="w-12 pl-6">
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onToggle(policy._id)}
        aria-label="Select policy"
        className="h-4 w-4 rounded border-slate-300 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
      />
    </TableCell>

    <TableCell>
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold uppercase text-blue-700">
          {policy.userId?.fullName?.charAt(0) || <FiUser />}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">
            {policy.userId?.fullName || "N/A"}
          </p>
          <p className="truncate text-xs text-slate-500">
            {policy.userId?.email}
          </p>
        </div>
      </div>
    </TableCell>

    <TableCell>
      <p className="text-sm font-medium text-slate-900">
        {policy.planId?.name || "Standard Plan"}
      </p>
      <p className="font-mono text-xs text-slate-500">#{policy.policyNumber}</p>
    </TableCell>

    <TableCell>
      <p className="text-xs text-slate-500">Premium</p>
      <p className="text-sm font-semibold tabular-nums text-slate-900">
        ${policy.premium}
      </p>
    </TableCell>

    <TableCell>
      <Badge
        variant="outline"
        className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize shadow-none ${getStatusStyles(
          policy.status,
        )}`}
      >
        {policy.status}
      </Badge>
    </TableCell>

    <TableCell className="pr-6 text-right">
      <AdminPolicyActions policy={policy} />
    </TableCell>
  </TableRow>
));

export default function PolicyList() {
  const { useAdminPolicies, updateStatus } = usePolicies();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm);

  const [selectedIds, setSelectedIds] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const { data, isLoading, refetch } = useAdminPolicies({
    page: currentPage,
    limit: itemsPerPage,
    category: activeTab === "All" ? undefined : activeTab,
    search: deferredSearch || undefined,
  });

  const policies = data?.policies || [];
  const totalCount = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const categories = ["All", "Health", "Life", "Vehicle", "Property"];

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [deferredSearch, activeTab]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleSelectPage = () => {
    if (selectedIds.length === policies.length) setSelectedIds([]);
    else setSelectedIds(policies.map((p) => p._id));
  };

  const handleBulkUpdate = async (newStatus) => {
    if (selectedIds.length === 0) return;
    setIsProcessing(true);
    let successCount = 0;
    for (let i = 0; i < selectedIds.length; i++) {
      try {
        await updateStatus.mutateAsync({
          id: selectedIds[i],
          data: { status: newStatus },
        });
        successCount++;
        setProgress(Math.round(((i + 1) / selectedIds.length) * 100));
      } catch (err) {
        console.error(err);
      }
    }
    toast(`Bulk updated ${successCount} policies`);
    setSelectedIds([]);
    setIsProcessing(false);
    setProgress(0);
    refetch();
  };

  const headClass =
    "h-11 text-xs font-semibold uppercase tracking-wider text-slate-500";

  return (
    <div className="relative min-h-screen w-full space-y-6 px-4 py-8 pb-32 md:px-8">
      {/* Bulk action bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-xl">
          {isProcessing ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span className="flex items-center gap-2">
                  <FiLoader className="animate-spin" /> Node Update in Progress
                </span>
                <span className="tabular-nums">{progress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 min-w-8 items-center justify-center rounded-md bg-blue-600 px-2 text-sm font-semibold tabular-nums text-white">
                  {selectedIds.length}
                </span>
                <span className="text-sm text-slate-600">Selected Nodes</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  onClick={() => setSelectedIds([])}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-9 bg-blue-600 px-4 text-white hover:bg-blue-700"
                  onClick={() => handleBulkUpdate("Active")}
                >
                  Approve Selection
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Policy Registry
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Network:{" "}
            <span className="font-medium text-slate-900">
              {totalCount.toLocaleString()}
            </span>{" "}
            Active Nodes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={toggleSelectPage}
            className="h-10 border-slate-300 bg-white px-4 text-sm text-slate-700 hover:bg-slate-50"
          >
            {selectedIds.length === policies.length && policies.length > 0
              ? "Clear Selection"
              : "Select Current Page"}
          </Button>
          <Button
            variant="outline"
            onClick={() => refetch()}
            aria-label="Refresh policies"
            className="h-10 w-10 border-slate-300 bg-white p-0 text-slate-600 hover:bg-slate-50"
          >
            <FiRefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search across secure index..."
            aria-label="Search policies"
            className="h-10 border-slate-300 bg-white pl-9 focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-10 rounded-lg bg-slate-100 p-1">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="rounded-md px-4 text-sm text-slate-600 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Table */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading && (
          <div className="absolute left-0 top-0 z-20 h-0.5 w-full animate-pulse bg-blue-600" />
        )}

        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="border-slate-200 hover:bg-slate-50">
              <TableHead className="w-12 pl-6" />
              <TableHead className={headClass}>Policy Holder</TableHead>
              <TableHead className={headClass}>Ref ID</TableHead>
              <TableHead className={headClass}>Coverage</TableHead>
              <TableHead className={headClass}>Status</TableHead>
              <TableHead className={`${headClass} pr-6 text-right`}>
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {policies.length === 0 && !isLoading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="h-56 text-center">
                  <FiInbox className="mx-auto mb-2 h-7 w-7 text-slate-300" />
                  <p className="text-sm text-slate-500">No Policies Found</p>
                </TableCell>
              </TableRow>
            ) : (
              policies.map((policy) => (
                <PolicyRow
                  key={policy._id}
                  policy={policy}
                  isSelected={selectedIds.includes(policy._id)}
                  onToggle={toggleSelect}
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
              {policies.length} / {totalCount.toLocaleString()}
            </span>
          </p>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous page"
              className="h-9 w-9 border-slate-300 bg-white"
              disabled={currentPage === 1 || isLoading}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            >
              <FiChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <Button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  variant="outline"
                  aria-current={currentPage === pageNum ? "page" : undefined}
                  className={`h-9 w-9 p-0 text-sm tabular-nums ${
                    currentPage === pageNum
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
              disabled={currentPage === totalPages || isLoading}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <FiChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
