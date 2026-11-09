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

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    // Handle forgot password logic
    console.log("Reset password for:", email);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Reset your password
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Enter your email address and we'll send you instructions to reset
            your password.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Email Address
            </Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
            />
          </div>
          <p className="text-sm text-gray-500">
            We'll email you a secure link to reset your password. The link will
            expire in 1 hour.
          </p>
        </div>
        <DialogFooter className="flex flex-col space-y-3 pt-4">
          <Button
            onClick={handleSubmit}
            className="w-full h-11 bg-gray-900 hover:bg-gray-800"
          >
            Send reset instructions
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
