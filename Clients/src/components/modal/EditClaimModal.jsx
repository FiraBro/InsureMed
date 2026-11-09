import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion"; // Added Motion
import {
  FileText,
  Calendar,
  DollarSign,
  User,
  ShieldCheck,
  Info,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0, scale: 0.98, y: 5 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.05,
    },
  },
  exit: { opacity: 0, scale: 0.98, y: 5, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function EditClaimModal({ claim, open, onClose }) {
  if (!claim) return null;

  const BACKEND_URL = "http://localhost:3001";

  const getDocumentUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${BACKEND_URL}${cleanPath}`;
  };

  const formatDate = (date) =>
    date ? format(new Date(date), "MMMM dd, yyyy") : "—";

  const getBannerColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-50 border-green-100 text-green-700";
      case "rejected":
        return "bg-red-50 border-red-100 text-red-700";
      default:
        return "bg-blue-50 border-blue-100 text-blue-700";
    }
  };

  const fullDocUrl = getDocumentUrl(claim.documentUrl);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border-zinc-200 bg-white p-0 overflow-hidden shadow-2xl sm:rounded-2xl">
        <AnimatePresence>
          {open && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col"
            >
              {/* Animated Header Banner */}
              <div
                className={`p-6 border-b border-inherit ${getBannerColor(
                  claim.status
                )}`}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 opacity-80">
                      <FileText className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">
                        Official Claim Record
                      </span>
                    </div>
                    <DialogTitle className="text-2xl font-black text-zinc-900">
                      {claim.claimType} Request
                    </DialogTitle>
                    <p className="text-xs text-zinc-500 font-mono">
                      ID: {claim._id}
                    </p>
                  </div>
                  <Badge className="px-4 py-1 text-sm capitalize font-bold shadow-none border-current/20">
                    {claim.status}
                  </Badge>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* Main Info Grid */}
                <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                  {[
                    {
                      label: "Claimant Information",
                      value: claim.user?.fullName || "Guest User",
                      sub: claim.user?.email,
                      icon: User,
                      color: "border-blue-500",
                    },
                    {
                      label: "Policy Reference",
                      value: claim.policyNumber,
                      sub: `Ref: ${claim.policyId?.slice(-8).toUpperCase()}`,
                      icon: ShieldCheck,
                      color: "border-purple-500",
                    },
                    {
                      label: "Submission Date",
                      value: formatDate(claim.submittedAt || claim.createdAt),
                      icon: Calendar,
                    },
                    {
                      label: "Claimed Amount",
                      value: `$${claim.amount?.toLocaleString()}`,
                      icon: DollarSign,
                      isAmount: true,
                    },
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      variants={itemVariants}
                      className="space-y-2"
                    >
                      <p className="text-[10px] text-zinc-400 flex items-center gap-1.5 uppercase font-black tracking-tight">
                        <item.icon className="w-3 h-3" /> {item.label}
                      </p>
                      <p
                        className={cn(
                          "font-bold text-zinc-800",
                          item.color && `border-l-2 ${item.color} pl-3`,
                          item.isAmount
                            ? "text-xl font-black text-zinc-900"
                            : "text-base"
                        )}
                      >
                        {item.value}
                      </p>
                      {item.sub && (
                        <p className="text-xs text-zinc-400 pl-3">{item.sub}</p>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Description Block */}
                <motion.div
                  variants={itemVariants}
                  className="space-y-3 pt-4 border-t border-zinc-50"
                >
                  <p className="text-[10px] text-zinc-400 uppercase font-black tracking-tight flex items-center gap-2">
                    <Info className="w-3 h-3" /> Incident Description
                  </p>
                  <div className="bg-zinc-50/50 p-5 rounded-xl border border-zinc-100 text-zinc-600 text-sm leading-relaxed shadow-inner">
                    {claim.reason ||
                      "The claimant did not provide a specific reason."}
                  </div>
                </motion.div>

                {/* Evidence Section */}
                <motion.div variants={itemVariants} className="space-y-3">
                  <p className="text-[10px] text-zinc-400 uppercase font-black tracking-tight">
                    Supporting Evidence
                  </p>
                  {fullDocUrl ? (
                    <motion.a
                      whileHover={{ scale: 1.01, x: 5 }}
                      whileTap={{ scale: 0.99 }}
                      href={fullDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 border border-zinc-200 rounded-xl hover:border-zinc-400 hover:bg-zinc-50 transition-all group shadow-sm"
                    >
                      <div className="bg-blue-500 p-2.5 rounded-lg">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                          View Attached Document{" "}
                          <ExternalLink className="w-3 h-3 opacity-50" />
                        </p>
                        <p className="text-xs text-zinc-400">
                          ID: {claim.documentUrl?.split("/").pop()}
                        </p>
                      </div>
                    </motion.a>
                  ) : (
                    <div className="text-center p-6 border-2 border-dashed border-zinc-100 rounded-xl">
                      <p className="text-xs text-zinc-400 italic">
                        No digital documents attached.
                      </p>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Action Footer */}
              <div className="bg-zinc-50 p-6 border-t border-zinc-100 flex justify-end">
                <Button
                  onClick={onClose}
                  className="px-8 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-400 transition-all shadow-lg active:scale-95"
                >
                  Close Record
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

// Simple Utility for classes
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
