import React, {
  useState,
  useCallback,
  useDeferredValue,
  useEffect,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiMoreVertical,
  FiEye,
  FiDownload,
  FiSearch,
  FiInbox,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
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
import { Card } from "@/components/ui/card";
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
    <motion.tr
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="group hover:bg-blue-50/30 transition-all border-none"
    >
      <TableCell className="py-5 pl-8">
        <div className="flex flex-col gap-1">
          {/* RESTORED POPULAR BADGE */}
          {plan.isPopular && (
            <Badge className="bg-rose-50 text-rose-600 border-none text-[9px] font-black uppercase tracking-tighter w-fit px-2 py-0 mb-1">
              Popular
            </Badge>
          )}
          <div className="font-bold text-zinc-900 group-hover:text-blue-700 transition-colors truncate max-w-[250px] font-manrope text-xs uppercase tracking-wide">
            {plan.name}
          </div>
          <div className="text-[10px] text-zinc-400 truncate max-w-[250px] italic">
            {plan.shortDescription}
          </div>
        </div>
      </TableCell>
      <TableCell className="px-6 font-black text-zinc-900 font-manrope text-xs">
        ${plan.premium}
        <span className="block text-[9px] text-blue-600 font-black uppercase tracking-widest uppercase">
          {plan.premiumFrequency}
        </span>
      </TableCell>
      <TableCell className="px-6">
        <div className="text-xs font-bold text-zinc-700 font-inter">
          ${plan.coverageAmount?.toLocaleString()}
        </div>
        <div className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">
          Coverage
        </div>
      </TableCell>
      <TableCell className="text-center px-6">
        <button
          onClick={() => onToggle(plan)}
          className="focus:outline-none active:scale-95 transition-transform"
        >
          <Badge
            className={`px-3 py-1 font-black text-[9px] uppercase tracking-wider border-none shadow-sm ${
              plan.status?.toLowerCase() === "published"
                ? "bg-emerald-50 text-emerald-600 shadow-emerald-50"
                : "bg-zinc-100 text-zinc-500"
            }`}
          >
            {plan.status}
          </Badge>
        </button>
      </TableCell>
      <TableCell className="text-right pr-8">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-sm"
            >
              <FiMoreVertical className="text-zinc-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-52 p-2 rounded-2xl shadow-2xl bg-white border border-zinc-100"
          >
            <DropdownMenuItem className="gap-3 py-2.5 cursor-pointer rounded-xl text-[11px] font-bold uppercase tracking-tight">
              <FiEye className="text-blue-600" /> Quick View
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onEdit(plan)}
              className="gap-3 py-2.5 cursor-pointer rounded-xl text-[11px] font-bold uppercase tracking-tight"
            >
              <FiEdit2 className="text-amber-600" /> Edit Plan
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 bg-zinc-100" />
            <DropdownMenuItem
              onClick={() => onDelete(plan._id)}
              className="gap-3 py-2.5 cursor-pointer rounded-xl text-rose-600 text-[11px] font-bold uppercase tracking-tight"
            >
              <FiTrash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </motion.tr>
  )
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
    [deletePlan]
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
    [updatePlan]
  );

  return (
    <div className="p-8 bg-zinc-50/30 min-h-screen max-w-screen-2xl mx-auto font-inter">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight uppercase font-manrope">
            Plan Inventory
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em]">
              Inventory:{" "}
              <span className="text-zinc-900">
                {totalCount.toLocaleString()}
              </span>{" "}
              Live Products
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg gap-2 px-6 h-12 text-[10px] font-black uppercase tracking-widest"
            onClick={() => navigate("/admin/create/plan")}
          >
            <FiPlus /> New Product
          </Button>
        </div>
      </header>

      {/* CONTROL BAR - CLEANED & SPACED */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white p-3 rounded-[2.5rem] border border-zinc-200 shadow-sm mb-8">
        {/* Left Side: Search */}
        <div className="relative flex-1 w-full max-w-2xl">
          <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 text-lg" />
          <Input
            placeholder="Search thousands of plans..."
            className="pl-14 h-14 bg-zinc-50/50 rounded-[1.5rem] text-sm font-medium border-2 border-gray-200 focus-visible:ring-0 focus-visible:border-blue-300 placeholder:text-zinc-400 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Right Side: Selects with extra gap */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center gap-4 p-1 w-full lg:w-auto justify-end"
        >
          {/* Status Filter */}
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-[150px]"
          >
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger
                className="w-full h-12 bg-zinc-100/50 rounded-xl text-[10px] font-black uppercase tracking-widest 
           border-2 border-gray-200 shadow-sm
           hover:border-blue-200 hover:bg-white
           focus:ring-0 focus:ring-offset-0 focus:border-blue-300 transition-all duration-300"
              >
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white/80 backdrop-blur-xl border-zinc-100 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <SelectItem
                  value="ALL"
                  className="focus:bg-blue-50 focus:text-blue-600 font-bold text-[10px] uppercase"
                >
                  All Status
                </SelectItem>
                <SelectItem
                  value="published"
                  className="focus:bg-blue-50 focus:text-blue-600 font-bold text-[10px] uppercase"
                >
                  Published
                </SelectItem>
                <SelectItem
                  value="draft"
                  className="focus:bg-blue-50 focus:text-blue-600 font-bold text-[10px] uppercase"
                >
                  Draft
                </SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Pagination Select */}
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-[120px]"
          >
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(v) => setItemsPerPage(Number(v))}
            >
              <SelectTrigger
                className="w-full h-12 bg-zinc-100/50 rounded-xl text-[10px] font-black uppercase tracking-widest 
           border-2 border-gray-200 shadow-sm
           hover:border-blue-200 hover:bg-white
           focus:ring-0 focus:ring-offset-0 focus:border-blue-300 transition-all duration-300"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white/80 backdrop-blur-xl border-zinc-100 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <SelectItem
                  value="25"
                  className="focus:bg-blue-50 focus:text-blue-600 font-bold text-[10px] uppercase"
                >
                  25 / Pg
                </SelectItem>
                <SelectItem
                  value="50"
                  className="focus:bg-blue-50 focus:text-blue-600 font-bold text-[10px] uppercase"
                >
                  50 / Pg
                </SelectItem>
                <SelectItem
                  value="100"
                  className="focus:bg-blue-50 focus:text-blue-600 font-bold text-[10px] uppercase"
                >
                  100 / Pg
                </SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
        </motion.div>
      </div>

      <Card className="border border-zinc-200 rounded-[2.5rem] overflow-hidden shadow-sm bg-white relative">
        <AnimatePresence>
          {(isFetching || isLoading) && (
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
              <TableHead className="py-6 pl-8 text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                Product Details
              </TableHead>
              <TableHead className="px-6 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                Premium
              </TableHead>
              <TableHead className="px-6 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                Coverage
              </TableHead>
              <TableHead className="px-6 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest text-center">
                Status
              </TableHead>
              <TableHead className="pr-8 py-6 text-right text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-zinc-50">
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
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-32 text-center text-zinc-300 font-black uppercase text-[10px]"
                >
                  <FiInbox className="mx-auto text-4xl mb-4" /> Empty Inventory
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* RESTORED BLUE PAGINATION FOOTER */}
        <div className="bg-white border-t border-zinc-100 px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              Scope
            </span>
            <div className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-[11px] font-bold shadow-md shadow-blue-100">
              {plans.length} <span className="text-blue-200 mx-1">/</span>{" "}
              {totalCount.toLocaleString()}
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-100/50 p-1 rounded-2xl border border-zinc-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl hover:bg-white disabled:opacity-30"
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
                  className={`h-9 w-9 rounded-xl text-[11px] font-black ${
                    currentPage === pageNum
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
              disabled={currentPage === totalPages || isLoading}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <FiChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em]">
            Index {currentPage} <span className="mx-2 text-zinc-200">|</span>{" "}
            {totalPages}
          </div>
        </div>
      </Card>
      <PlanEditModal
        plan={editingPlan}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}
