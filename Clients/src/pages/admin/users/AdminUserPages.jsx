import { useState, useDeferredValue, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FiSearch,
  FiEye,
  FiTrash2,
  FiFileText,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiRefreshCw,
} from "react-icons/fi";
import { useUsers } from "@/hooks/useUser";

// Table Row Animation
const rowVariants = {
  hidden: { opacity: 0, y: 5 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: 10, transition: { duration: 0.1 } },
};

// Modal Animation
const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 300 },
  },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2 } },
};

export default function AdminUsersPage() {
  // --- UI State ---
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);

  const deferredSearch = useDeferredValue(search);

  // --- Hook Integration ---
  const {
    data,
    isLoading,
    isFetching,
    deleteUser,
    isProcessing,
    exportToCSV,
    isExporting,
  } = useUsers({
    page: currentPage,
    limit: 10,
    search: deferredSearch,
    status: filter,
  });

  // --- DATA MAPPING FIX ---
  // Reaching into data.data.users based on your console log
  const users = data?.data?.users || [];
  const totalRecords = Number(data?.total) || 0;
  const totalPages = Number(data?.totalPages) || 1;

  // Safe navigation checks
  const canNext = currentPage < totalPages;
  const canPrev = currentPage > 1;

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearch, filter]);

  const handleDelete = async (id) => {
    if (window.confirm("Permanently delete this user record?")) {
      await deleteUser(id);
    }
  };

  return (
    <div className="p-8 bg-zinc-50/30 min-h-screen max-w-screen-2xl mx-auto font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            User Registry
          </h1>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] mt-1">
            Database Status:{" "}
            <span className="text-blue-600 font-black">
              {totalRecords.toLocaleString()}
            </span>{" "}
            Verified Entities
          </p>
        </div>

        {/* --- CONSISTENT BLUE DOWNLOAD BUTTON --- */}
        <Button
          onClick={exportToCSV}
          disabled={isExporting || isLoading}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase text-[12px] tracking-widest px-6 h-11 rounded-xl shadow-lg shadow-blue-100 border-none transition-all active:scale-95 flex items-center gap-2"
        >
          {isExporting ? (
            <FiRefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <FiDownload className="h-4 w-4" />
          )}
          {isExporting ? "Processing..." : "Export CSV"}
        </Button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6 justify-between items-center bg-white p-4 rounded-2xl border border-zinc-200/60 shadow-sm">
        <Tabs
          value={filter}
          onValueChange={setFilter}
          className="w-full lg:w-auto"
        >
          <TabsList className="bg-zinc-100/80 border border-zinc-200/50 p-1 rounded-xl">
            <TabsTrigger
              value="all"
              className="text-[10px] font-black uppercase px-6"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="applicant"
              className="text-[10px] font-black uppercase px-6"
            >
              Applicants
            </TabsTrigger>
            <TabsTrigger
              value="registered"
              className="text-[10px] font-black uppercase px-6"
            >
              Registered
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full lg:w-96">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Search identity or email..."
            className="pl-12 h-11 bg-zinc-50/50 border-zinc-200 focus-visible:ring-blue-600 rounded-xl transition-all placeholder:text-zinc-400 text-sm font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="border border-zinc-200 rounded-[2rem] overflow-hidden shadow-sm bg-white relative">
        {/* Loading Progress Bar */}
        {(isFetching || isExporting) && (
          <div className="absolute top-0 left-0 w-full h-[2px] bg-zinc-100 overflow-hidden z-10">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                repeat: Infinity,
                duration: 1.2,
                ease: "easeInOut",
              }}
              className="h-full w-1/3 bg-blue-600"
            />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50/50 border-b border-zinc-100 text-[10px] font-black uppercase text-zinc-400 tracking-widest">
              <tr>
                <th className="px-8 py-6 text-left">Identity</th>
                <th className="px-8 py-6 text-left">Contact</th>
                <th className="px-8 py-6 text-left">Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>

            <motion.tbody layout className="divide-y divide-zinc-50">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-8 py-10 bg-zinc-50/20" />
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-32 text-center">
                      <FiUser className="mx-auto text-5xl text-blue-100 mb-4" />
                      <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                        Zero Results Found
                      </p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <motion.tr
                      key={user._id}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                      className="hover:bg-blue-50/30 transition-all group"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          {/* --- BLUE IDENTITY ICON --- */}
                          <div className="h-10 w-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-blue-100">
                            {user.fullName?.[0]}
                          </div>
                          <span className="font-bold text-zinc-800 tracking-tight">
                            {user.fullName}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-zinc-500 font-medium">
                        {user.email}
                      </td>
                      <td className="px-8 py-5">
                        {user.isApplicant ? (
                          <Badge className="bg-blue-600/10 text-blue-700 border-none px-3 py-1 font-black text-[9px] uppercase tracking-wider">
                            <FiFileText className="mr-1.5" /> Applicant
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-zinc-200 text-zinc-400 font-black text-[9px] uppercase tracking-wider px-3 py-1"
                          >
                            Registered
                          </Badge>
                        )}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 rounded-lg hover:bg-blue-50 hover:text-blue-600"
                            onClick={() => {
                              setSelectedUser(user);
                              setViewOpen(true);
                            }}
                          >
                            <FiEye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 rounded-lg hover:bg-red-50 hover:text-red-600"
                            onClick={() => handleDelete(user._id)}
                            disabled={isProcessing}
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </motion.tbody>
          </table>
        </div>

        {/* --- BLUE PAGINATION FOOTER --- */}
        <div className="bg-white border-t border-zinc-100 px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              Scope
            </span>
            <div className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-[11px] font-bold shadow-md shadow-blue-100">
              {users.length} <span className="text-blue-200 mx-1">/</span>{" "}
              {totalRecords.toLocaleString()}
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-100/50 p-1 rounded-2xl border border-zinc-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl hover:bg-white disabled:opacity-30"
              disabled={!canPrev || isFetching}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              <FiChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => {
                const isActive = currentPage === pageNum;
                return (
                  <Button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-9 w-9 rounded-xl text-[11px] font-black transition-all ${
                      isActive
                        ? "bg-white text-blue-600 shadow-sm border border-blue-100"
                        : "text-zinc-400 hover:text-blue-600"
                    }`}
                    variant="ghost"
                  >
                    {pageNum}
                  </Button>
                );
              }
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl hover:bg-white disabled:opacity-30"
              disabled={!canNext || isFetching}
              onClick={() => setCurrentPage((prev) => prev + 1)}
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

      {/* --- CONSISTENT BLUE PROFILE DIALOG --- */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="p-0 border-none max-w-md bg-white overflow-hidden rounded-[2rem] shadow-2xl">
          <AnimatePresence>
            {viewOpen && (
              <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {/* Blue Banner */}
                <div className="h-32 bg-blue-600 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                </div>

                <div className="px-8 pb-8">
                  <div className="-mt-12 h-24 w-24 rounded-3xl bg-white p-1.5 shadow-xl mb-6 relative z-10">
                    <div className="h-full w-full rounded-2xl bg-blue-50 flex items-center justify-center text-3xl font-black text-blue-600">
                      {selectedUser?.fullName?.[0]}
                    </div>
                  </div>

                  <DialogHeader className="mb-8">
                    <DialogTitle className="text-2xl font-black text-zinc-900 uppercase tracking-tight leading-none">
                      {selectedUser?.fullName}
                    </DialogTitle>
                    <p className="text-zinc-400 font-medium text-sm mt-1">
                      {selectedUser?.email}
                    </p>
                  </DialogHeader>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-blue-50/30 border border-blue-100/50">
                      <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">
                        Status
                      </p>
                      <p className="text-xs font-bold text-blue-700 uppercase">
                        {selectedUser?.isApplicant ? "Applicant" : "Registered"}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                      <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">
                        Created
                      </p>
                      <p className="text-xs font-bold text-zinc-800 uppercase">
                        {new Date(selectedUser?.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <DialogFooter className="p-4 border-t border-zinc-50">
                  <Button
                    variant="ghost"
                    className="w-full text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-blue-600"
                    onClick={() => setViewOpen(false)}
                  >
                    Close Profile
                  </Button>
                </DialogFooter>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
}
