import React, {
  useState,
  useCallback,
  useDeferredValue,
  useEffect,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiMoreVertical,
  FiEye,
  FiSearch,
  FiInbox,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { usePlans } from "@/hooks/usePlan";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlanEditModal } from "@/components/modal/PLanEditModal";
import { toast } from "react-toastify";

const VirtualTableRow = React.memo(
  ({ plan, index, onDelete, onToggle, onEdit }) => (
    <TableRow className="h-[72px] border-slate-100 transition-colors hover:bg-slate-50">
      <TableCell className="pl-6">
        <div className="flex items-center gap-2">
          <p className="max-w-[260px] truncate text-sm font-medium text-slate-900">
            {plan.name}
          </p>
          {plan.isPopular && (
            <Badge
              variant="outline"
              className="rounded-full border-blue-200 bg-blue-50 px-2 py-0 text-xs font-medium text-blue-700 shadow-none"
            >
              Popular
            </Badge>
          )}
        </div>
        <p className="mt-0.5 max-w-[320px] truncate text-xs text-slate-500">
          {plan.shortDescription}
        </p>
      </TableCell>

      <TableCell>
        <p className="text-sm font-semibold tabular-nums text-slate-900">
          ${plan.premium}
        </p>
        <p className="text-xs capitalize text-slate-500">
          {plan.premiumFrequency}
        </p>
      </TableCell>

      <TableCell>
        <p className="text-sm font-medium tabular-nums text-slate-900">
          ${plan.coverageAmount?.toLocaleString()}
        </p>
        <p className="text-xs text-slate-500">Coverage</p>
      </TableCell>

      <TableCell className="text-center">
        <button
          type="button"
          onClick={() => onToggle(plan)}
          aria-label={`Toggle status, currently ${plan.status}`}
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40"
        >
          <Badge
            variant="outline"
            className={`cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-medium capitalize shadow-none ${
              plan.status?.toLowerCase() === "published"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-slate-100 text-slate-600"
            }`}
          >
            {plan.status}
          </Badge>
        </button>
      </TableCell>

      <TableCell className="pr-6 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Plan actions"
              className="h-9 w-9 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <FiMoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
          >
            <DropdownMenuItem className="cursor-pointer gap-2.5 rounded-md py-2 text-sm text-slate-700">
              <FiEye className="text-slate-500" /> Quick View
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onEdit(plan)}
              className="cursor-pointer gap-2.5 rounded-md py-2 text-sm text-slate-700"
            >
              <FiEdit2 className="text-slate-500" /> Edit Plan
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 bg-slate-100" />
            <DropdownMenuItem
              onClick={() => onDelete(plan._id)}
              className="cursor-pointer gap-2.5 rounded-md py-2 text-sm text-red-600 focus:bg-red-50 focus:text-red-700"
            >
              <FiTrash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  ),
);

export default function AdminPlanListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { listAdmin, deletePlan, updatePlan, exportPlans } = usePlans();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [editingPlan, setEditingPlan] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const deferredSearch = useDeferredValue(searchTerm);

  // NAVIGATION REFRESH FIX
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["plans", "admin"] });
  }, [location.pathname, queryClient]);

  const { data, isLoading, isFetching } = listAdmin({
    page: currentPage,
    limit: itemsPerPage,
    search: deferredSearch,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });

  const plans = data?.plans || [];
  const totalCount = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearch, statusFilter]);

  const handleDelete = useCallback(
    async (id) => {
      if (!confirm("Are you sure?")) return;
      try {
        await deletePlan.mutateAsync(id);
        toast("Plan removed");
      } catch (e) {
        toast.error(e.message);
      }
    },
    [deletePlan],
  );

  const toggleStatus = useCallback(
    async (plan) => {
      const newStatus =
        plan.status?.toLowerCase() === "published" ? "draft" : "published";
      try {
        await updatePlan.mutateAsync({
          id: plan._id,
          data: { status: newStatus },
        });
        toast(`Plan is now ${newStatus}`);
      } catch (e) {
        toast(e.message);
      }
    },
    [updatePlan],
  );

  const headClass =
    "h-11 text-xs font-semibold uppercase tracking-wider text-slate-500";
  const selectTriggerClass =
    "h-10 border-slate-300 bg-white text-sm text-slate-700 focus:ring-2 focus:ring-blue-600/20 focus:ring-offset-0";
  const selectContentClass = "rounded-lg border-slate-200 bg-white shadow-lg";
  const selectItemClass = "text-sm focus:bg-blue-50 focus:text-blue-700";

  return (
    <div className="min-h-screen w-full space-y-6 px-4 py-8 md:px-8">
      {/* Header */}
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Plan Inventory
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Inventory:{" "}
            <span className="font-medium text-slate-900">
              {totalCount.toLocaleString()}
            </span>{" "}
            Live Products
          </p>
        </div>
        <Button
          className="h-10 gap-2 bg-blue-600 px-4 text-white hover:bg-blue-700"
          onClick={() => navigate("/admin/create/plan")}
        >
          <FiPlus /> New Product
        </Button>
      </header>

      {/* Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search thousands of plans..."
            aria-label="Search plans"
            className="h-10 border-slate-300 bg-white pl-9 focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className={`${selectTriggerClass} w-[150px]`}>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className={selectContentClass}>
              <SelectItem value="ALL" className={selectItemClass}>
                All Status
              </SelectItem>
              <SelectItem value="published" className={selectItemClass}>
                Published
              </SelectItem>
              <SelectItem value="draft" className={selectItemClass}>
                Draft
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={itemsPerPage.toString()}
            onValueChange={(v) => setItemsPerPage(Number(v))}
          >
            <SelectTrigger className={`${selectTriggerClass} w-[120px]`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={selectContentClass}>
              <SelectItem value="25" className={selectItemClass}>
                25 / Pg
              </SelectItem>
              <SelectItem value="50" className={selectItemClass}>
                50 / Pg
              </SelectItem>
              <SelectItem value="100" className={selectItemClass}>
                100 / Pg
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {(isFetching || isLoading) && (
          <div className="absolute left-0 top-0 z-20 h-0.5 w-full animate-pulse bg-blue-600" />
        )}

        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="border-slate-200 hover:bg-slate-50">
              <TableHead className={`${headClass} pl-6`}>
                Product Details
              </TableHead>
              <TableHead className={headClass}>Premium</TableHead>
              <TableHead className={headClass}>Coverage</TableHead>
              <TableHead className={`${headClass} text-center`}>
                Status
              </TableHead>
              <TableHead className={`${headClass} pr-6 text-right`}>
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.length > 0 ? (
              plans.map((plan, idx) => (
                <VirtualTableRow
                  key={plan._id}
                  plan={plan}
                  index={idx}
                  onDelete={handleDelete}
                  onToggle={toggleStatus}
                  onEdit={(p) => {
                    setEditingPlan(p);
                    setIsEditModalOpen(true);
                  }}
                />
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="h-56 text-center">
                  <FiInbox className="mx-auto mb-2 h-7 w-7 text-slate-300" />
                  <p className="text-sm text-slate-500">Empty Inventory</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Footer */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-3 sm:flex-row">
          <p className="text-sm text-slate-500">
            Scope:{" "}
            <span className="font-medium tabular-nums text-slate-900">
              {plans.length} / {totalCount.toLocaleString()}
            </span>
          </p>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous page"
              className="h-9 w-9 border-slate-300 bg-white"
              disabled={currentPage === 1 || isLoading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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

      <PlanEditModal
        plan={editingPlan}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}
