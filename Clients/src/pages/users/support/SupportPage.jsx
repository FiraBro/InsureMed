import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import {
  FiPlus,
  FiSearch,
  FiChevronRight,
  FiActivity,
  FiClock,
  FiLifeBuoy,
} from "react-icons/fi";

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

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
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

  // Navbar visibility
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();

    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
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

    const formData = new FormData(e.currentTarget);
    const textContent = formData.get("userQuery");

    const payload = {
      subject: formData.get("subject"),
      category: formData.get("category"),
      priority: formData.get("priority"),
      userQuery: textContent,
      description: textContent,
    };

    try {
      await createTicket(payload);
      setIsModalOpen(false);
      e.target.reset();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full min-w-0 min-h-full bg-white overflow-x-hidden">
      {/* Header */}
      <motion.nav
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{
          duration: 0.35,
          ease: "easeInOut",
        }}
        className="sticky top-0 z-30 w-full bg-white border-b border-slate-200"
      >
        <div className="w-full px-6 lg:px-10 h-16 flex items-center justify-end">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button
                className="
                  h-11 px-5
                  bg-white text-slate-700
                  border border-slate-200
                  hover:bg-slate-50
                  hover:border-slate-300
                  rounded-lg
                  text-xs font-semibold
                  shadow-sm
                  transition-all
                "
              >
                <FiPlus className="mr-2 size-4" />
                Initialize Case
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[550px] bg-white rounded-2xl border border-slate-200 shadow-xl p-8 overflow-hidden">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900">
                  Create Intelligence Ticket
                </DialogTitle>

                <DialogDescription className="text-sm text-slate-500">
                  Submit your request and provide the necessary details.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateTicket} className="space-y-5 py-6">
                {/* Category and Priority */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-600">
                      Category
                    </Label>

                    <Select name="category" required defaultValue="ACCOUNT">
                      <SelectTrigger className="rounded-lg border-slate-200 bg-white h-11">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>

                      <SelectContent className="bg-white">
                        <SelectItem value="CLAIM">Claim Request</SelectItem>
                        <SelectItem value="PAYMENT">Billing/Payment</SelectItem>
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
                      <SelectTrigger className="rounded-lg border-slate-200 bg-white h-11">
                        <SelectValue placeholder="Priority" />
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
                    placeholder="E.g., Secure login failure"
                    className="rounded-lg border-slate-200 bg-white h-11"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600">
                    Analysis Details
                  </Label>

                  <Textarea
                    name="userQuery"
                    placeholder="Describe your issue..."
                    className="rounded-lg border-slate-200 bg-white min-h-[120px] resize-none"
                    required
                  />
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="submit"
                    disabled={isCreating}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-lg h-11 font-semibold"
                  >
                    {isCreating ? "Creating..." : "Initialize Case"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.nav>

      {/* Main Content */}
      <motion.main
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-none min-w-0 px-5 sm:px-6 lg:px-10 py-8"
      >
        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8 w-full">
          <MetricCard
            label="Active Requests"
            val={pagination.total}
            icon={<FiActivity />}
            color="text-indigo-600"
          />

          <MetricCard
            label="System Accuracy"
            val="99.8%"
            icon={<FiLifeBuoy />}
            color="text-emerald-600"
          />

          <MetricCard
            label="Avg Response"
            val="1.4h"
            icon={<FiClock />}
            color="text-purple-600"
          />
        </div>

        {/* Case Records */}
        <motion.div
          variants={itemVariants}
          className="space-y-5 w-full min-w-0"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Case Records
            </h2>

            <div className="relative w-full sm:w-72">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <Input
                placeholder="Filter records..."
                className="pl-11 h-11 bg-white border-slate-200 rounded-lg text-sm"
                onChange={(e) =>
                  setFilters((p) => ({
                    ...p,
                    search: e.target.value,
                    page: 1,
                  }))
                }
              />
            </div>
          </div>

          <Card className="w-full border border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Case Intel</th>
                      <th className="px-6 py-4">Ticket ID</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Access</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-slate-400 text-sm"
                        >
                          Loading cases...
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
                            className="mt-3 border-slate-200 bg-white"
                          >
                            Retry
                          </Button>
                        </td>
                      </tr>
                    ) : tickets.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <FiLifeBuoy className="size-8 text-slate-300" />
                            <p className="text-sm font-semibold text-slate-700">
                              No cases found
                            </p>
                            <p className="text-xs text-slate-400">
                              Your support requests will appear here.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <AnimatePresence>
                        {tickets.map((t, idx) => (
                          <motion.tr
                            key={t._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{
                              duration: 0.2,
                              delay: idx * 0.03,
                            }}
                            className="hover:bg-slate-50 transition-colors group"
                          >
                            <td className="px-6 py-5">
                              <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                {t.subject}
                              </p>

                              <Badge
                                variant="outline"
                                className="text-xs font-medium border-slate-200 text-slate-500 rounded-md mt-2"
                              >
                                {t.category}
                              </Badge>
                            </td>

                            <td className="px-6 py-5 font-mono text-xs text-slate-500">
                              {t.ticketId}
                            </td>

                            <td className="px-6 py-5">
                              <PriorityBadge priority={t.priority} />
                            </td>

                            <td className="px-6 py-5">
                              <Badge
                                className={`${getStatusStyles(
                                  t.status,
                                )} border rounded-md text-xs font-semibold uppercase px-2.5 py-1`}
                              >
                                {t.status.replace("_", " ")}
                              </Badge>
                            </td>

                            <td className="px-6 py-5 text-right">
                              <Button
                                variant="ghost"
                                onClick={() =>
                                  navigate(
                                    `/dashboard/support/tickets/${t._id}`,
                                  )
                                }
                                className="h-9 w-9 p-0 rounded-lg hover:bg-slate-900 hover:text-white transition-all"
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
          {!isLoading && !isMyTicketsError && pagination.pages > 1 && (
            <div className="flex items-center justify-between gap-4 text-sm text-slate-500">
              <span>
                Page {pagination.page} of {pagination.pages}
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={pagination.page <= 1}
                  onClick={() =>
                    setFilters((current) => ({
                      ...current,
                      page: Math.max(current.page - 1, 1),
                    }))
                  }
                  className="border-slate-200 bg-white"
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() =>
                    setFilters((current) => ({
                      ...current,
                      page: Math.min(current.page + 1, pagination.pages),
                    }))
                  }
                  className="border-slate-200 bg-white"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.main>
    </div>
  );
};

// Metric Card
const MetricCard = ({ label, val, icon, color }) => (
  <motion.div variants={itemVariants} className="w-full">
    <Card className="border border-slate-200 shadow-sm rounded-xl bg-white group hover:shadow-md transition-all duration-300">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            {label}
          </p>

          <p className="text-3xl font-bold text-slate-900 tracking-tight">
            {val}
          </p>
        </div>

        <div
          className={`h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center ${color} text-xl transition-transform group-hover:scale-105`}
        >
          {icon}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Priority Badge
const PriorityBadge = ({ priority }) => {
  const styles = {
    LOW: "text-slate-600 bg-slate-100",
    MEDIUM: "text-blue-600 bg-blue-50",
    HIGH: "text-orange-600 bg-orange-50",
    EMERGENCY: "text-red-600 bg-red-50 font-bold",
  };

  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
        styles[priority] || styles.LOW
      }`}
    >
      {priority}
    </span>
  );
};

// Status Styles
const getStatusStyles = (status) => {
  switch (status) {
    case "OPEN":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";

    case "IN_REVIEW":
      return "bg-indigo-50 text-indigo-700 border-indigo-100";

    case "WAITING":
      return "bg-amber-50 text-amber-700 border-amber-100";

    case "RESOLVED":
      return "bg-slate-100 text-slate-600 border-slate-200";

    case "CLOSED":
      return "bg-slate-200 text-slate-500 border-transparent";

    default:
      return "bg-slate-50 text-slate-500 border-slate-200";
  }
};

export default GeneralSupportPage;
