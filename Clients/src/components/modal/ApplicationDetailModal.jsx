import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Calendar,
  User,
  ShieldCheck,
  Activity,
  Users,
  CreditCard,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { resolveDocumentUrl } from "@/utils/resolveURL";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function ApplicationDetailModal({
  app,
  open,
  onOpenChange,
  onApprove,
  onReject,
  isProcessing,
}) {
  if (!app) return null;

  const formatDate = (date) =>
    date ? format(new Date(date), "MMMM dd, yyyy") : "—";

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return {
          color: "bg-emerald-50 border-emerald-100 text-emerald-700",
          icon: CheckCircle,
        };
      case "rejected":
        return {
          color: "bg-rose-50 border-rose-100 text-rose-700",
          icon: XCircle,
        };
      default:
        return {
          color: "bg-amber-50 border-amber-100 text-amber-700",
          icon: Clock,
        };
    }
  };

  const statusStyle = getStatusConfig(app.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-zinc-200 bg-white shadow-2xl rounded-[2rem]">
        <AnimatePresence>
          {open && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col h-[85vh]"
            >
              {/* Header Banner */}
              <div className={`p-8 border-b ${statusStyle.color}`}>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 opacity-70">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                        Underwriting Review
                      </span>
                    </div>
                    <DialogTitle className="text-3xl font-black text-zinc-900 tracking-tight">
                      {app.planId?.name || "Insurance Plan"}
                    </DialogTitle>
                    <p className="text-xs font-mono text-zinc-500 opacity-60">
                      ID: {app._id}
                    </p>
                  </div>
                  <Badge
                    className={`px-4 py-1.5 rounded-full font-bold border-none shadow-sm ${statusStyle.color} bg-white`}
                  >
                    <statusStyle.icon className="w-3.5 h-3.5 mr-2 inline" />
                    {app.status}
                  </Badge>
                </div>
              </div>

              <div className="flex-1 flex overflow-hidden">
                {/* Left: Content Area */}
                <ScrollArea className="flex-1 p-8 bg-white">
                  <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-2 gap-8 mb-10"
                  >
                    <InfoItem
                      icon={User}
                      label="Applicant"
                      value={app.personal?.fullName}
                      sub={app.personal?.email}
                    />
                    <InfoItem
                      icon={Calendar}
                      label="Submission Date"
                      value={formatDate(app.createdAt)}
                    />
                    <InfoItem
                      icon={Users}
                      label="Nominee"
                      value={app.nominee?.name}
                      sub={app.nominee?.relationship}
                    />
                    <InfoItem
                      icon={CreditCard}
                      label="Payment Plan"
                      value={app.payment?.frequency}
                      sub={app.payment?.method}
                    />
                  </motion.div>

                  <Separator className="my-8 opacity-50" />

                  <motion.div variants={itemVariants} className="space-y-4">
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5" /> Medical Declaration
                    </h4>
                    <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-100 shadow-inner italic text-zinc-600 text-sm leading-relaxed">
                      "{app.medical?.history || "No medical history declared."}"
                    </div>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="mt-8 space-y-4"
                  >
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5" /> Identity & Proof
                      Documents
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {app.documents?.map((doc, i) => (
                        <a
                          key={i}
                          href={resolveDocumentUrl(doc.url)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 bg-white hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              <FileText className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-zinc-700">
                              {doc.name || `Document ${i + 1}`}
                            </span>
                          </div>
                          <ExternalLink className="w-4 h-4 text-zinc-300 group-hover:text-blue-500" />
                        </a>
                      ))}
                    </div>
                  </motion.div>
                </ScrollArea>

                {/* Right: Preview (Only if documents exist) */}
                {app.documents?.[0] && (
                  <div className="w-[40%] bg-zinc-100 border-l border-zinc-100 relative">
                    <iframe
                      src={resolveDocumentUrl(app.documents[0].url)}
                      className="w-full h-full border-none"
                      title="Quick Preview"
                    />
                    <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-[9px] text-white font-bold uppercase">
                      Primary Evidence
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="text-zinc-500 font-bold hover:bg-zinc-100"
                >
                  Close
                </Button>

                <div className="flex items-center gap-3">
                  {app.status === "pending" && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => onReject(app._id)}
                        disabled={isProcessing}
                        className="border-zinc-200 text-rose-600 hover:bg-rose-50 hover:border-rose-100 font-bold px-6"
                      >
                        Reject Request
                      </Button>
                      <Button
                        onClick={() => onApprove(app._id)}
                        disabled={isProcessing}
                        className="bg-zinc-900 text-white hover:bg-zinc-800 font-black px-8 shadow-xl shadow-zinc-200"
                      >
                        {isProcessing ? "Processing..." : "Approve & Finalize"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

// Helper Component for consistency
function InfoItem({ icon: Icon, label, value, sub }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] text-zinc-400 uppercase font-black tracking-tight flex items-center gap-2">
        <Icon className="w-3 h-3" /> {label}
      </p>
      <p className="text-base font-bold text-zinc-800 border-l-2 border-zinc-100 pl-3 leading-none py-1">
        {value}
      </p>
      {sub && (
        <p className="text-xs text-zinc-400 pl-3 lowercase font-medium">
          {sub}
        </p>
      )}
    </div>
  );
}
