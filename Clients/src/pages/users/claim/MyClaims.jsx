import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useClaims } from "@/hooks/useClaim";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
  CheckCircle,
  Clock,
  FileText,
  PlusCircle,
  Search,
  Filter,
  RefreshCw,
  Eye,
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
          field?.toLowerCase().includes(searchTerm.toLowerCase()),
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
        ["pending", "processing"].includes(c.status?.toLowerCase()),
      ).length,
      totalAmount: data.reduce(
        (sum, c) => sum + (parseFloat(c.amount) || 0),
        0,
      ),
    };
  }, [myClaims]);

  if (loading) return <LoadingSkeleton />;

  const headClass =
    "h-11 text-xs font-semibold uppercase tracking-wider text-slate-500";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Claims Center
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Track and manage your insurance requests
            </p>
          </div>
          <Button
            onClick={() => navigate("/dashboard/claims/new")}
            className="h-10 bg-blue-600 text-white hover:bg-blue-700"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> New Claim
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Filed"
            value={stats.total}
            icon={<FileText className="h-5 w-5" />}
          />
          <StatCard
            title="Approved"
            value={stats.approved}
            icon={<CheckCircle className="h-5 w-5" />}
          />
          <StatCard
            title="Processing"
            value={stats.pending}
            icon={<Clock className="h-5 w-5" />}
          />
          <StatCard
            title="Total Value"
            value={`$${stats.totalAmount.toLocaleString()}`}
            icon={<DollarSign className="h-5 w-5" />}
          />
        </div>

        {/* Filters & Table */}
        <Card className="overflow-hidden rounded-xl border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by policy..."
                aria-label="Search claims"
                className="h-10 border-slate-300 pl-9 focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 w-[160px] border-slate-300 bg-white text-slate-700 focus:ring-2 focus:ring-blue-600/20">
                  <Filter className="mr-2 h-4 w-4 text-slate-400" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="border-slate-200 bg-white">
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
                aria-label="Refresh claims"
                className="h-10 w-10 border-slate-300 text-slate-600 hover:bg-slate-50"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="border-slate-200 hover:bg-slate-50">
                  <TableHead className={`${headClass} pl-6`}>
                    Claim ID
                  </TableHead>
                  <TableHead className={headClass}>Policy Number</TableHead>
                  <TableHead className={headClass}>Type</TableHead>
                  <TableHead className={`${headClass} text-right`}>
                    Amount
                  </TableHead>
                  <TableHead className={`${headClass} text-center`}>
                    Status
                  </TableHead>
                  <TableHead className={`${headClass} pr-6 text-right`}>
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedClaims.map((claim) => (
                  <TableRow
                    key={claim._id}
                    className="h-14 border-slate-100 transition-colors hover:bg-slate-50"
                  >
                    <TableCell className="pl-6 font-mono text-xs text-slate-500">
                      #{claim._id?.slice(-6)}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-slate-900">
                      {claim.policyNumber}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {claim.claimType}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold tabular-nums text-slate-900">
                      ${claim.amount?.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge status={claim.status} />
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/claims/${claim._id}`)}
                        className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Eye className="mr-2 h-4 w-4" /> Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <CardFooter className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3">
            <p className="text-sm text-slate-500">
              Page {currentPage} of {totalPages || 1}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                aria-label="Previous page"
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
                className="h-9 border-slate-300 bg-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                aria-label="Next page"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="h-9 border-slate-300 bg-white"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }) {
  const s = status?.toLowerCase();
  const base = "rounded-full px-2.5 py-0.5 text-xs font-medium shadow-none";
  if (s === "approved")
    return (
      <Badge
        className={`${base} border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50`}
      >
        Approved
      </Badge>
    );
  if (s === "rejected")
    return (
      <Badge
        className={`${base} border-red-200 bg-red-50 text-red-700 hover:bg-red-50`}
      >
        Rejected
      </Badge>
    );
  return (
    <Badge
      className={`${base} border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50`}
    >
      Pending
    </Badge>
  );
}

function LoadingSkeleton() {
  return (
    <div className="w-full space-y-6 px-4 py-8 md:px-8">
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[400px] w-full rounded-xl" />
    </div>
  );
}
