import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function AccountStep({
  formData,
  onChange,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
}) {
  return (
    <div className="space-y-4">
      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
          Full Name *
        </Label>
        <Input
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={onChange}
          placeholder="John Doe"
          className="h-12 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
          required
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label
          htmlFor="register-email"
          className="text-sm font-medium text-gray-700"
        >
          Email Address *
        </Label>
        <Input
          id="register-email"
          name="email"
          type="email"
          value={formData.email}
          onChange={onChange}
          placeholder="name@company.com"
          className="h-12 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
          required
        />
      </div>

      {/* Password */}
      <div className="space-y-2 relative">
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
          Password *
        </Label>
        <Input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={onChange}
          placeholder="Create a strong password"
          className="h-12 border-gray-300 focus:border-gray-900 focus:ring-gray-900 pr-20"
          required
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute top-1/2 right-3 -translate-y-1/2 px-2 py-1 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? "Hide" : "Show"}
        </Button>
        <p className="text-xs text-gray-500 mt-1">
          Must be at least 8 characters with uppercase, lowercase, and numbers
        </p>
      </div>

      {/* Confirm Password */}
      <div className="space-y-2 relative">
        <Label
          htmlFor="passwordConfirm"
          className="text-sm font-medium text-gray-700"
        >
          Confirm Password *
        </Label>
        <Input
          id="passwordConfirm"
          name="passwordConfirm"
          type={showConfirmPassword ? "text" : "password"}
          value={formData.passwordConfirm}
          onChange={onChange}
          placeholder="Confirm your password"
          className="h-12 border-gray-300 focus:border-gray-900 focus:ring-gray-900 pr-20"
          required
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute top-1/2 right-3 -translate-y-1/2 px-2 py-1 text-gray-500 hover:text-gray-700"
        >
          {showConfirmPassword ? "Hide" : "Show"}
        </Button>
      </div>
    </div>
  );
}
