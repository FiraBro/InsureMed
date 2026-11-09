import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useClaims } from "@/hooks/useClaim";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  PlusCircle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Shield,
  ChevronLeft,
  ChevronRight,
  DollarSign,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function MyClaims() {
  const navigate = useNavigate();
  const { myClaims = [], loading, refresh } = useClaims();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // FIX: Prevent Navbar/Layout shifting when Select opens
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      body { 
        padding-right: 0px !important; 
        overflow: auto !important; 
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const filteredClaims = useMemo(() => {
    const data = Array.isArray(myClaims) ? myClaims : [];
    return data.filter((claim) => {
      const matchesSearch =
        !searchTerm ||
        [claim.policyNumber, claim.claimType].some((field) =>
          field?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesStatus =
        statusFilter === "all" ||
        claim.status?.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [myClaims, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredClaims.length / itemsPerPage);
  const paginatedClaims = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredClaims.slice(start, start + itemsPerPage);
  }, [filteredClaims, currentPage]);

  const stats = useMemo(() => {
    const data = Array.isArray(myClaims) ? myClaims : [];
    return {
      total: data.length,
      approved: data.filter((c) => c.status?.toLowerCase() === "approved")
        .length,
      pending: data.filter((c) =>
        ["pending", "processing"].includes(c.status?.toLowerCase())
      ).length,
      totalAmount: data.reduce(
        (sum, c) => sum + (parseFloat(c.amount) || 0),
        0
      ),
    };
  }, [myClaims]);

  if (loading) return <LoadingSkeleton />;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-slate-50/50 p-4 md:p-8"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <Shield className="h-6 w-6" />
              </div>
              Claims Center
            </h1>
            <p className="text-slate-500 mt-2">
              Track and manage your insurance requests
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Button
              onClick={() => navigate("/claims/new")}
              className="text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-95"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> New Claim
            </Button>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Filed"
            value={stats.total}
            icon={<FileText className="text-blue-500" />}
          />
          <StatCard
            title="Approved"
            value={stats.approved}
            icon={<CheckCircle className="text-emerald-500" />}
          />
          <StatCard
            title="Processing"
            value={stats.pending}
            icon={<Clock className="text-amber-500" />}
          />
          <StatCard
            title="Total Value"
            value={`$${stats.totalAmount.toLocaleString()}`}
            icon={<DollarSign className="text-slate-600" />}
            isDark
          />
        </div>

        {/* Filters & Table */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-white flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search by policy..."
                className="pl-9 border-slate-200 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[148] border border-gray-200 rounded-xl bg-white text-gray-700 focus:ring-blue-400 ">
                  <Filter className="h-4 w-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="border border-gray-300 bg-white">
                  <SelectItem value="all">All Claims</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={refresh}
                className="border-slate-200"
              >
                <RefreshCw className="h-4 w-4 text-slate-600" />
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="border-slate-200">
                  <TableHead className="text-slate-600 font-semibold">
                    Claim ID
                  </TableHead>
                  <TableHead className="text-slate-600 font-semibold">
                    Policy Number
                  </TableHead>
                  <TableHead className="text-slate-600 font-semibold">
                    Type
                  </TableHead>
                  <TableHead className="text-slate-600 font-semibold text-right">
                    Amount
                  </TableHead>
                  <TableHead className="text-slate-600 font-semibold text-center">
                    Status
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="wait">
                  {paginatedClaims.map((claim) => (
                    <TableRow
                      key={claim._id}
                      className="border-slate-100 hover:bg-slate-50/50 transition-colors"
                    >
                      <TableCell className="font-mono text-xs text-slate-400">
                        #{claim._id?.slice(-6)}
                      </TableCell>
                      <TableCell className="font-medium text-slate-700">
                        {claim.policyNumber}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-600 hover:bg-slate-100"
                        >
                          {claim.claimType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-slate-900">
                        ${claim.amount?.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status={claim.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/claims/${claim._id}`)}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye className="h-4 w-4 mr-2" /> Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>

          <CardFooter className="flex items-center justify-between border-t border-slate-100 p-4 bg-slate-50/30">
            <p className="text-sm text-slate-500">
              Page {currentPage} of {totalPages || 1}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
                className="border-slate-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="border-slate-200"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </motion.div>
  );
}

// Sub-components for cleaner code
function StatCard({ title, value, icon, isDark }) {
  return (
    <Card
      className={`border-slate-200 shadow-sm transition-all hover:shadow-md ${
        isDark ? "bg-slate-900 text-white border-slate-800" : "bg-white"
      }`}
    >
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p
            className={`text-sm font-medium ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {title}
          </p>
          <h3 className="text-2xl font-bold mt-1 tracking-tight">{value}</h3>
        </div>
        <div
          className={`p-3 rounded-xl ${
            isDark ? "bg-slate-800" : "bg-slate-50 border border-slate-100"
          }`}
        >
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }) {
  const s = status?.toLowerCase();
  if (s === "approved")
    return (
      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
        Approved
      </Badge>
    );
  if (s === "rejected")
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
        Rejected
      </Badge>
    );
  return (
    <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
      Pending
    </Badge>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[400px] w-full rounded-xl" />
    </div>
  );
}
