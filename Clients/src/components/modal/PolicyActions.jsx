import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { FiShield, FiCalendar, FiDollarSign } from "react-icons/fi";

export default function AdminPolicyActions({ policy }) {
  const [open, setOpen] = useState(false);

  const plan = policy.planId || {};
  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "-");

  return (
    <div>
      {/* View Details Button */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm">View Details</Button>
        </DialogTrigger>

        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-gray-50 border border-gray-200">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="p-6"
          >
            {/* Header */}
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {plan.name || "Policy Details"}
              </DialogTitle>
              <DialogDescription className="text-gray-500">
                Policy No: {policy.policyNumber || "N/A"}
              </DialogDescription>
            </DialogHeader>

            {/* Status & Category */}
            <div className="flex gap-2 mt-4 flex-wrap">
              <Badge className="bg-blue-100 text-blue-700">
                {policy.status}
              </Badge>
              <Badge variant="outline" className="border-gray-400">
                {plan.category || "Uncategorized"}
              </Badge>
            </div>

            <Separator className="my-6" />

            {/* Overview */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex gap-3 items-start">
                <FiDollarSign className="text-indigo-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Premium</p>
                  <p className="font-semibold">
                    ${policy.premium || plan.premium} /{" "}
                    {plan.premiumFrequency || "period"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <FiCalendar className="text-indigo-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Validity</p>
                  <p className="font-semibold">
                    {formatDate(policy.startDate)} →{" "}
                    {formatDate(policy.endDate)}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <FiShield className="text-indigo-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Coverage Amount</p>
                  <p className="font-semibold">
                    ${plan.coverageAmount?.toLocaleString() || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Coverage Summary */}
            <div>
              <h4 className="font-semibold mb-2">Coverage Summary</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {plan.coverage || "No coverage details available"}
              </p>
            </div>

            {/* Policy Details */}
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <h4 className="font-semibold mb-2">Policy Information</h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>Network Size: {plan.networkSize || "N/A"}</li>
                  <li>Deductible: ${plan.deductible || "N/A"}</li>
                  <li>
                    Claim Settlement:{" "}
                    {plan.claimSettlementRatio
                      ? `${plan.claimSettlementRatio}%`
                      : "N/A"}
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Key Features</h4>
                <div className="flex flex-wrap gap-2">
                  {plan.features?.length ? (
                    plan.features.slice(0, 6).map((f, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {f}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No features listed</p>
                  )}
                </div>
              </div>
            </div>

            {/* Close Button */}
            <DialogClose asChild>
              <Button className="mt-8 w-full border-blue-600" variant="outline">
                Close
              </Button>
            </DialogClose>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
