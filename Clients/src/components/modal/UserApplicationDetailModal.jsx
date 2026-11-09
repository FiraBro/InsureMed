import React from "react";
import { motion, AnimatePresence } from "framer-motion"; // Add Framer Motion
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  FiUser,
  FiActivity,
  FiUsers,
  FiCreditCard,
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiFileText,
  FiShield,
  FiBriefcase,
  FiExternalLink,
} from "react-icons/fi";
import { resolveDocumentUrl } from "@/utils/resolveURL";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.05, // Stagger the sections inside
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

export default function UserApplicationDetailModal({
  app,
  open,
  onOpenChange,
}) {
  if (!app) return null;

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden border-zinc-200 bg-white shadow-2xl rounded-[2rem] outline-none">
        {/* Wrap content in motion.div for entry animation */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col h-full"
        >
          {/* Header Section */}
          <div className="p-8 pb-6 bg-white">
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <motion.div
                  variants={itemVariants}
                  className="flex items-center gap-2 text-zinc-400"
                >
                  <FiShield className="w-3 h-3" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                    {app.planId?.category || "Insurance Plan"}
                  </p>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <DialogTitle className="text-3xl font-black text-zinc-900 tracking-tight">
                    {app.planId?.name}
                  </DialogTitle>
                </motion.div>
              </div>
              <motion.div variants={itemVariants}>
                <Badge className="px-4 py-1.5 rounded-full border shadow-none font-bold text-[11px] uppercase tracking-wider bg-zinc-50 text-zinc-900">
                  {app.status}
                </Badge>
              </motion.div>
            </div>

            <motion.div
              variants={itemVariants}
              className="grid grid-cols-3 gap-6"
            >
              <Metric
                label="Premium"
                value={`$${app.planId?.premium}/${app.payment?.frequency}`}
              />
              <Metric
                label="Coverage"
                value={`$${app.planId?.coverageAmount?.toLocaleString()}`}
              />
              <Metric label="Deductible" value={`$${app.planId?.deductible}`} />
            </motion.div>
          </div>

          <Separator className="opacity-50" />

          <ScrollArea className="max-h-[60vh]">
            <div className="p-8 space-y-10">
              {/* Coverage Timeline with soft fade */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-2 gap-4"
              >
                <InfoBlock
                  label="Policy Start"
                  value={formatDate(app.startDate)}
                  icon={FiCalendar}
                />
                <InfoBlock
                  label="Policy End"
                  value={formatDate(app.endDate)}
                  icon={FiCalendar}
                />
              </motion.div>

              <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
                <motion.div variants={itemVariants}>
                  <Section label="Applicant Information" icon={FiUser}>
                    <div className="mt-2 space-y-1">
                      <p className="font-bold text-zinc-900">
                        {app.personal?.fullName}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {app.personal?.email}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {app.personal?.phone}
                      </p>
                    </div>
                  </Section>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Section label="Nominee Details" icon={FiUsers}>
                    <div className="mt-2 space-y-1">
                      <p className="font-bold text-zinc-900">
                        {app.nominee?.name}
                      </p>
                      <p className="text-sm text-zinc-500 capitalize">
                        {app.nominee?.relationship}
                      </p>
                    </div>
                  </Section>
                </motion.div>

                <motion.div variants={itemVariants} className="col-span-2">
                  <Section label="Medical History" icon={FiActivity}>
                    <div className="mt-2 p-4 bg-zinc-50 rounded-xl border border-zinc-100 text-sm text-zinc-600 italic">
                      "{app.medical?.history || "No medical history reported."}"
                    </div>
                  </Section>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Section label="Documents" icon={FiFileText}>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {app.documents?.map((doc, i) => (
                        <a
                          key={doc._id}
                          href={resolveDocumentUrl(doc.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 rounded-lg hover:border-zinc-900 hover:bg-zinc-50 transition-all group shadow-sm"
                        >
                          <FiFileText className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-900" />
                          <span className="text-[11px] font-bold text-zinc-600 group-hover:text-zinc-900">
                            {doc.name || `File ${i + 1}`}
                          </span>
                        </a>
                      ))}
                    </div>
                  </Section>
                </motion.div>
              </div>
            </div>
          </ScrollArea>

          <div className="p-6 bg-zinc-50/50 border-t border-zinc-100 flex justify-end">
            <button
              onClick={() => onOpenChange(false)}
              className="px-8 py-2.5 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-all active:scale-95 shadow-xl"
            >
              Close Record
            </button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

// ... Helper components (Metric, Section, InfoBlock) stay same as previous ...

/* Internal Components */
function Metric({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
        {label}
      </p>
      <p className="text-lg font-black text-zinc-900 tracking-tight">{value}</p>
    </div>
  );
}

function Section({ label, icon: Icon, children, fullWidth }) {
  return (
    <div className={fullWidth ? "col-span-2" : ""}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5 text-zinc-300" />
        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em]">
          {label}
        </h3>
      </div>
      {children}
    </div>
  );
}

function InfoBlock({ label, value, icon: Icon }) {
  return (
    <div className="p-5 bg-white rounded-2xl border border-zinc-100 shadow-sm">
      <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest mb-1 flex items-center gap-2">
        <Icon className="w-3 h-3" /> {label}
      </p>
      <p className="text-sm font-bold text-zinc-900">{value}</p>
    </div>
  );
}
