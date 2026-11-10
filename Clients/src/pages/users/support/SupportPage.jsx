import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiSearch, FiChevronRight, FiLifeBuoy } from "react-icons/fi";

import { useTickets } from "@/hooks/useTicket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: "easeOut",
    },
  },
};

const GeneralSupportPage = () => {
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 5,
    search: "",
  });

  const {
    myTickets,
    isLoading,
    isMyTicketsError,
    myTicketsError,
    refetchMyTickets,
    createTicket,
    isCreating,
  } = useTickets(null, false, filters);

  const tickets = myTickets?.data || [];

  const pagination = myTickets?.pagination || {
    page: 1,
    pages: 1,
    total: 0,
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const description = formData.get("userQuery");

    const payload = {
      subject: formData.get("subject"),
      category: formData.get("category"),
      priority: formData.get("priority"),
      userQuery: description,
      description,
    };

    try {
      await createTicket(payload);
      form.reset();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create support ticket:", error);
    }
  };

  const handleSearch = (e) => {
    setFilters((current) => ({
      ...current,
      search: e.target.value,
      page: 1,
    }));
  };

  const handlePageChange = (page) => {
    setFilters((current) => ({
      ...current,
      page,
    }));
  };

  return (
    <div className="w-full min-w-0 bg-white overflow-x-hidden">
      {/* Page Header */}
      <div className="w-full px-5 sm:px-6 lg:px-10 py-5 flex justify-end border-b border-slate-200 bg-white">
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              className="h-11 px-5 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <FiPlus className="mr-2 size-4" />
              Initialize Case
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[550px] bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900">
                Create Support Ticket
              </DialogTitle>

              <DialogDescription className="text-sm text-slate-500">
                Describe your issue so our support team can assist you.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateTicket} className="space-y-5 py-5">
              {/* Category and Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600">
                    Category
                  </Label>

                  <Select name="category" required defaultValue="ACCOUNT">
                    <SelectTrigger className="h-11 rounded-lg border-slate-200 bg-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>

                    <SelectContent className="bg-white">
                      <SelectItem value="CLAIM">Claim Request</SelectItem>
                      <SelectItem value="PAYMENT">Billing / Payment</SelectItem>
                      <SelectItem value="POLICY">Policy Update</SelectItem>
                      <SelectItem value="ACCOUNT">Account Access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600">
                    Priority
                  </Label>

                  <Select name="priority" required defaultValue="LOW">
                    <SelectTrigger className="h-11 rounded-lg border-slate-200 bg-white">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>

                    <SelectContent className="bg-white">
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="EMERGENCY">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-600">
                  Subject
                </Label>

                <Input
                  name="subject"
                  placeholder="Enter your issue subject"
                  className="h-11 rounded-lg border-slate-200"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-600">
                  Description
                </Label>

                <Textarea
                  name="userQuery"
                  placeholder="Describe your issue in detail..."
                  className="min-h-[120px] rounded-lg border-slate-200 resize-none"
                  required
                />
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="w-full h-11 rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-semibold"
                >
                  {isCreating ? "Creating..." : "Create Ticket"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content */}
      <motion.main
        initial="hidden"
        animate="visible"
        className="w-full min-w-0 px-5 sm:px-6 lg:px-10 py-8"
      >
        <motion.section variants={itemVariants} className="w-full space-y-5">
          {/* Section Header and Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                My Support Cases
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                View and manage your support requests.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <Input
                value={filters.search}
                onChange={handleSearch}
                placeholder="Search tickets..."
                className="h-11 pl-11 rounded-lg border-slate-200 bg-white"
              />
            </div>
          </div>

          {/* Ticket Table */}
          <Card className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-xs font-semibold uppercase text-slate-500">
                      <th className="px-6 py-4">Subject</th>
                      <th className="px-6 py-4">Ticket ID</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-14 text-center text-sm text-slate-500"
                        >
                          Loading your support cases...
                        </td>
                      </tr>
                    ) : isMyTicketsError ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <p className="text-sm font-semibold text-red-600">
                            Could not load your support cases.
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {myTicketsError?.response?.data?.message ||
                              myTicketsError?.message ||
                              "Please try again."}
                          </p>

                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => refetchMyTickets()}
                            className="mt-4 border-slate-200"
                          >
                            Retry
                          </Button>
                        </td>
                      </tr>
                    ) : tickets.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <FiLifeBuoy className="size-9 text-slate-300" />

                            <p className="text-sm font-semibold text-slate-700">
                              No support cases found
                            </p>

                            <p className="text-xs text-slate-400">
                              Create a support ticket if you need assistance.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <AnimatePresence>
                        {tickets.map((ticket) => (
                          <motion.tr
                            key={ticket._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="group hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-6 py-5">
                              <p className="text-sm font-semibold text-slate-900">
                                {ticket.subject}
                              </p>

                              <Badge
                                variant="outline"
                                className="mt-2 rounded-md border-slate-200 text-xs text-slate-500"
                              >
                                {ticket.category}
                              </Badge>
                            </td>

                            <td className="px-6 py-5 font-mono text-xs text-slate-500">
                              {ticket.ticketId || "—"}
                            </td>

                            <td className="px-6 py-5">
                              <PriorityBadge priority={ticket.priority} />
                            </td>

                            <td className="px-6 py-5">
                              <Badge
                                className={`${getStatusStyles(ticket.status)} rounded-md border px-2.5 py-1 text-xs font-semibold uppercase`}
                              >
                                {(ticket.status || "UNKNOWN").replaceAll(
                                  "_",
                                  " ",
                                )}
                              </Badge>
                            </td>

                            <td className="px-6 py-5 text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() =>
                                  navigate(
                                    `/dashboard/support/tickets/${ticket._id}`,
                                  )
                                }
                                aria-label="View ticket"
                                className="h-9 w-9 rounded-lg p-0 hover:bg-slate-900 hover:text-white"
                              >
                                <FiChevronRight size={18} />
                              </Button>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          {!isLoading && !isMyTicketsError && pagination.pages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
              <span>
                Page {pagination.page} of {pagination.pages}
              </span>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className="border-slate-200"
                >
                  Previous
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className="border-slate-200"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </motion.section>
      </motion.main>
    </div>
  );
};

// Priority Badge
const PriorityBadge = ({ priority }) => {
  const styles = {
    LOW: "bg-slate-100 text-slate-600",
    MEDIUM: "bg-blue-50 text-blue-600",
    HIGH: "bg-orange-50 text-orange-600",
    EMERGENCY: "bg-red-50 text-red-600",
  };

  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${
        styles[priority] || styles.LOW
      }`}
    >
      {priority || "LOW"}
    </span>
  );
};

// Ticket Status Styles
const getStatusStyles = (status) => {
  const styles = {
    OPEN: "bg-emerald-50 text-emerald-700 border-emerald-100",
    IN_REVIEW: "bg-blue-50 text-blue-700 border-blue-100",
    WAITING: "bg-amber-50 text-amber-700 border-amber-100",
    RESOLVED: "bg-slate-100 text-slate-600 border-slate-200",
    CLOSED: "bg-slate-200 text-slate-500 border-transparent",
  };

  return styles[status] || "bg-slate-50 text-slate-500 border-slate-200";
};

export default GeneralSupportPage;
