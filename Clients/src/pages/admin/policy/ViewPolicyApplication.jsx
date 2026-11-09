import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function ViewPolicyApplication() {
  const [openApprove, setOpenApprove] = useState(false);
  const [openReject, setOpenReject] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* User Details */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-semibold text-lg mb-2">User Information</h3>
            <p>
              <strong>Name:</strong> John Doe
            </p>
            <p>
              <strong>Email:</strong> john@email.com
            </p>
          </div>

          {/* Documents */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-semibold text-lg mb-2">Uploaded Documents</h3>
            <img src="/placeholder.png" className="w-40 rounded-md border" />
          </div>

          {/* Plan Summary */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-semibold text-lg mb-2">Plan Summary</h3>
            <p>
              <strong>Plan:</strong> Health Basic
            </p>
            <p>
              <strong>Premium:</strong> $45/month
            </p>
            <p>
              <strong>Coverage:</strong> $5000
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button onClick={() => setOpenApprove(true)} className="w-full">
              Approve
            </Button>

            <Button
              variant="destructive"
              onClick={() => setOpenReject(true)}
              className="w-full"
            >
              Reject
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Approve Modal */}
      <Dialog open={openApprove} onOpenChange={setOpenApprove}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Approval</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to approve this application?</p>
          <DialogFooter>
            <Button onClick={() => setOpenApprove(false)}>Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={openReject} onOpenChange={setOpenReject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
          </DialogHeader>

          <Textarea placeholder="Enter reason for rejection" />

          <DialogFooter>
            <Button variant="destructive" onClick={() => setOpenReject(false)}>
              Submit Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
