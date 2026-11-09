import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function LoginForm({
  formData,
  onChange,
  onSubmit,
  isLoading,
  onSwitchToRegister,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-3xl">
        <h2 className="text-3xl font-semibold text-gray-900 text-center">
          Welcome Back
        </h2>
        <p className="text-gray-600 text-center">
          Login to continue to your dashboard
        </p>
        <form onSubmit={onSubmit} className="space-y-5 w-full mt-6">
          {/* Email */}
          <div className="w-full">
            <label className="block text-gray-700 font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              className="
                w-full 
                px-4 py-3 
                rounded-xl 
                border border-gray-300 
                focus:ring-4
                focus:ring-blue-200 
                focus:border-blue-500
                transition-all
              "
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Password */}
          <div className="relative w-full">
            <label className="block text-gray-700 font-medium mb-1">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={onChange}
              className="
                w-full 
                px-4 py-3 
                rounded-xl 
                border border-gray-300 
                focus:ring-4
                focus:ring-blue-200 
                focus:border-blue-500
                transition-all
              "
              placeholder="••••••••"
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
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Don’t have an account?{" "}
          <Button
            variant="link"
            size="sm"
            onClick={onSwitchToRegister}
            className="text-blue-500 cursor-pointer"
          >
            Register
          </Button>
        </p>
      </div>
    </div>
  );
}
