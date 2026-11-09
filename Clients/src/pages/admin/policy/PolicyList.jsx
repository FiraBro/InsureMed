import React, {
  useState,
  useMemo,
  useDeferredValue,
  useEffect,
  memo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePolicies } from "@/hooks/usePolicy";
import {
  FiRefreshCw,
  FiSearch,
  FiInbox,
  FiChevronLeft,
  FiChevronRight,
  FiCheckSquare,
  FiX,
  FiLoader,
  FiUser,
  FiShield,
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
      return "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-50";
    case "pending":
      return "bg-zinc-100 text-zinc-500 border-zinc-200";
    case "expired":
      return "bg-rose-50 text-rose-600 border-rose-100";
    default:
      return "bg-gray-50 text-gray-400";
  }
};

/* ---------------- MEMOIZED ROW ---------------- */
const PolicyRow = memo(({ policy, isSelected, onToggle, isProcessing }) => (
  <TableRow
    className={`hover:bg-blue-50/30 transition-all group border-none ${
      isSelected ? "bg-blue-50/20" : ""
    }`}
  >
    <TableCell className="pl-8 py-5 w-10">
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onToggle(policy._id)}
        className="w-4 h-4 rounded border-zinc-300 data-[state=checked]:bg-blue-600"
      />
    </TableCell>

    <TableCell className="px-6 py-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-lg font-manrope">
          {policy.userId?.fullName?.charAt(0) || <FiUser />}
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-zinc-900 font-manrope text-xs leading-none mb-1.5 uppercase tracking-wide">
            {policy.userId?.fullName || "N/A"}
          </span>
          <span className="text-[10px] text-zinc-400 font-medium font-inter">
            {policy.userId?.email}
          </span>
        </div>
      </div>
    </TableCell>

    <TableCell className="px-6 py-5">
      <div className="flex flex-col">
        <span className="font-black text-zinc-700 font-manrope text-[10px] mb-1 uppercase tracking-tighter">
          {policy.planId?.name || "Standard Plan"}
        </span>
        <span className="text-[9px] text-blue-600 font-bold uppercase tracking-widest">
          #{policy.policyNumber}
        </span>
      </div>
    </TableCell>

    <TableCell className="px-6 py-5">
      <div className="flex flex-col">
        <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-1">
          Premium
        </span>
        <span className="font-black text-zinc-900 font-manrope text-xs">
          ${policy.premium}
        </span>
      </div>
    </TableCell>

    <TableCell className="px-6 py-5">
      <Badge
        className={`px-3 py-1 font-black text-[9px] uppercase tracking-wider border-none ${getStatusStyles(
          policy.status
        )}`}
      >
        {policy.status}
      </Badge>
    </TableCell>

    <TableCell className="pr-8 py-5 text-right">
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

  const { data, isLoading, isPlaceholderData, refetch } = useAdminPolicies({
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
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
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

  return (
    <div className="p-8 bg-zinc-50/30 min-h-screen max-w-screen-2xl mx-auto font-inter relative pb-32">
      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 100, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
            exit={{ y: 100, x: "-50%", opacity: 0 }}
            className="fixed bottom-10 left-1/2 z-50 bg-zinc-900 text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-8 border border-zinc-800 min-w-[500px]"
          >
            {isProcessing ? (
              <div className="flex flex-col w-full gap-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  <span className="flex items-center gap-2">
                    <FiLoader className="animate-spin" /> Node Update in
                    Progress
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500"
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 pr-8 border-r border-zinc-800">
                  <div className="bg-blue-600 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black">
                    {selectedIds.length}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Selected Nodes
                  </span>
                </div>
                <div className="flex flex-1 items-center gap-4">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase px-6"
                    onClick={() => handleBulkUpdate("Active")}
                  >
                    Approve Selection
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-zinc-500 hover:text-white text-[10px] font-black uppercase"
                    onClick={() => setSelectedIds([])}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight uppercase font-manrope">
            Policy Registry
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em]">
              Network:{" "}
              <span className="text-zinc-900">
                {totalCount.toLocaleString()}
              </span>{" "}
              Active Nodes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={toggleSelectPage}
            className="rounded-2xl border-zinc-200 text-[10px] font-black uppercase px-6 h-12 shadow-sm bg-white"
          >
            {selectedIds.length === policies.length && policies.length > 0
              ? "Clear Selection"
              : "Select Current Page"}
          </Button>
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="rounded-2xl border-zinc-200 h-12 w-12 bg-white shadow-sm"
          >
            <FiRefreshCw
              className={`w-4 h-4 text-zinc-500 ${
                isLoading ? "animate-spin" : ""
              }`}
            />
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-2 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Search across secure index..."
            className="pl-14 h-14 bg-zinc-50/50 border-none rounded-[1.5rem] text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-1">
          <TabsList className="bg-zinc-100/50 rounded-[1.2rem] h-12 p-1">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="rounded-xl px-6 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Table Content */}
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
            <TableRow className="border-b border-zinc-100 hover:bg-transparent">
              <TableHead className="pl-8 py-6 w-10"></TableHead>
              <TableHead className="px-6 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest font-manrope">
                Policy Holder
              </TableHead>
              <TableHead className="px-6 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest font-manrope">
                Ref ID
              </TableHead>
              <TableHead className="px-6 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest font-manrope">
                Coverage
              </TableHead>
              <TableHead className="px-6 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest font-manrope">
                Status
              </TableHead>
              <TableHead className="pr-8 py-6 text-right text-[10px] font-black uppercase text-zinc-400 tracking-widest font-manrope">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-zinc-50">
            {policies.length === 0 && !isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-32 text-center text-zinc-300 font-black uppercase text-[10px]"
                >
                  <FiInbox className="mx-auto text-4xl mb-4" />
                  No Policies Found
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

        {/* --- BLUE PAGINATION FOOTER --- */}
        <div className="bg-white border-t border-zinc-100 px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              Scope
            </span>
            <div className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-[11px] font-bold shadow-md shadow-blue-100">
              {policies.length} <span className="text-blue-200 mx-1">/</span>{" "}
              {totalCount.toLocaleString()}
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-100/50 p-1 rounded-2xl border border-zinc-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl hover:bg-white disabled:opacity-30"
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
                  className={`h-9 w-9 rounded-xl text-[11px] font-black ${
                    currentPage === pageNum
                      ? "bg-white text-blue-600 shadow-sm border border-blue-100"
                      : "text-zinc-400"
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
      </div>
    </div>
  );
}
