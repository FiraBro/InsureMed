import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTickets } from "@/hooks/useTicket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FiMessageSquare,
  FiRefreshCcw,
  FiSearch,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
  FiClock,
} from "react-icons/fi";
import { Loader2 } from "lucide-react";

const AdminSupportDashboard = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    status: "",
  });

  const { allTickets, isLoading, updateStatus, refetchAll } = useTickets(
    null,
    true,
    filters
  );

  const tickets = allTickets?.data.data || [];
  const pagination = allTickets?.pagination || { page: 1, pages: 1, total: 0 };

  const getStatusStyle = (status) => {
    const s = status?.toUpperCase();
    switch (s) {
      case "OPEN":
        return "text-blue-600 bg-blue-50 border-blue-100";
      case "IN_REVIEW":
        return "text-amber-600 bg-amber-50 border-amber-100";
      case "RESOLVED":
        return "text-emerald-600 bg-emerald-50 border-emerald-100";
      default:
        return "text-slate-500 bg-slate-50 border-slate-100";
    }
  };

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="max-w-[1400px] mx-auto">
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Tickets <span className="text-blue-600">Console</span>
            </h1>
            <p className="text-slate-500 font-medium">
              Enterprise Support Management System
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => refetchAll?.()}
            className="rounded-xl border-slate-200 bg-white shadow-sm hover:bg-slate-50 gap-2 font-bold text-slate-600"
          >
            <FiRefreshCcw className={isLoading ? "animate-spin" : ""} />
            Sync Queue
          </Button>
        </div>

        {/* --- Advanced Filter Bar --- */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by ID, User, or Subject..."
              className="pl-11 h-12 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium"
              value={filters.search}
              onChange={(e) =>
                setFilters((p) => ({ ...p, search: e.target.value, page: 1 }))
              }
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative">
              <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                className="h-12 pl-11 pr-8 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-600 outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500/20"
                value={filters.status}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, status: e.target.value, page: 1 }))
                }
              >
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- Main Data Table --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Reference
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Requester
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Subject & Category
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Status Control
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2
                          className="animate-spin text-blue-600"
                          size={32}
                        />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Loading Records...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <p className="text-slate-400 font-bold uppercase text-sm tracking-tight">
                        No support tickets found
                      </p>
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr
                      key={ticket._id}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          #
                          {ticket.ticketId ||
                            ticket._id.slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800">
                            {ticket.user?.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {ticket.user?.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold text-slate-700 truncate max-w-[300px]">
                            {ticket.subject}
                          </span>
                          <Badge className="w-fit text-[9px] font-black uppercase bg-slate-100 text-slate-500 border-none px-2 py-0">
                            {ticket.category}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={ticket.status}
                          onChange={(e) =>
                            updateStatus({
                              id: ticket._id,
                              status: e.target.value,
                            })
                          }
                          className={`text-[10px] font-black uppercase py-1.5 px-3 rounded-lg border outline-none cursor-pointer transition-all ${getStatusStyle(
                            ticket.status
                          )}`}
                        >
                          <option value="OPEN">Open</option>
                          <option value="IN_REVIEW">In Review</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              navigate(`/admin/tickets/${ticket._id}`)
                            }
                            className="h-9 w-9 p-0 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-none"
                          >
                            <FiMessageSquare size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-9 w-9 p-0 rounded-xl hover:bg-slate-900 hover:text-white shadow-none"
                            onClick={() =>
                              navigate(`/admin/tickets/${ticket._id}`)
                            }
                          >
                            <FiExternalLink size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* --- Bottom Pagination --- */}
          <div className="bg-slate-50/50 border-t border-slate-100 px-6 py-4 flex flex-col md:row justify-between items-center gap-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              Total: <span className="text-slate-900">{pagination.total}</span>{" "}
              Entries • Page {pagination.page} of {pagination.pages}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={filters.page === 1}
                onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
                className="h-9 w-9 rounded-xl border-slate-200 bg-white"
              >
                <FiChevronLeft size={18} />
              </Button>

              <div className="flex gap-1">
                {[...Array(pagination.pages)]
                  .map((_, i) => (
                    <Button
                      key={i}
                      variant={filters.page === i + 1 ? "default" : "ghost"}
                      size="sm"
                      className={`h-9 w-9 rounded-xl font-bold ${
                        filters.page === i + 1
                          ? "bg-blue-600 shadow-lg shadow-blue-200"
                          : ""
                      }`}
                      onClick={() => setFilters((p) => ({ ...p, page: i + 1 }))}
                    >
                      {i + 1}
                    </Button>
                  ))
                  .slice(
                    Math.max(0, filters.page - 3),
                    Math.min(pagination.pages, filters.page + 2)
                  )}
              </div>

              <Button
                variant="outline"
                size="icon"
                disabled={filters.page === pagination.pages}
                onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
                className="h-9 w-9 rounded-xl border-slate-200 bg-white"
              >
                <FiChevronRight size={18} />
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 flex justify-center gap-8 opacity-40">
          <div className="flex items-center gap-2">
            <FiClock size={12} />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
              Real-time sync active
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSupportDashboard;
