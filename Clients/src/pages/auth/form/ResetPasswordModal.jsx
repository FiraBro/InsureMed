import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function ResetPasswordModal({ isOpen, onClose }) {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = () => {
    // Handle reset password logic
    console.log("Reset password with token:", token);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Create new password
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Enter your reset token and create a new secure password.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Reset Token
            </Label>
            <Input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter 6-digit code"
              className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              New Password
            </Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Confirm Password
            </Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
            />
          </div>
        </div>
        <DialogFooter className="flex flex-col space-y-3 pt-4">
          <Button
            onClick={handleSubmit}
            className="w-full h-11 bg-gray-900 hover:bg-gray-800"
          >
            Update password
          </Button>
          <Button
            variant="outline"
            className="w-full h-11 border-gray-300 hover:bg-gray-50"
            onClick={onClose}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
