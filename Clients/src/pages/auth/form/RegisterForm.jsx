import { useState } from "react";
import { toast } from "react-toastify";
import StepIndicator from "./StepIndicator";
import AccountStep from "./AccountStep";
import PersonalInfoStep from "./PersonalInfoStep";
import AddressStep from "./AddressStep";
import { Button } from "@/components/ui/button";

const steps = ["Account Details", "Personal Info", "Address"];

export default function RegisterForm({
  formData,
  onChange,
  onSubmit,
  isLoading,
  onSwitchToLogin,
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateCurrentStep = () => {
    if (activeStep === 0) {
      if (!formData.fullName.trim()) {
        toast.error("Please enter your full name");
        return false;
      }
      if (!formData.email.trim()) {
        toast.error("Please enter your email");
        return false;
      }
      if (!formData.password.trim()) {
        toast.error("Please enter a password");
        return false;
      }
      if (formData.password !== formData.passwordConfirm) {
        toast.error("Passwords do not match");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    if (activeStep === steps.length - 1) {
      if (!acceptTerms) {
        toast.error("Please accept the terms and conditions");
        return;
      }
      onSubmit();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      {/* 1. Wider Step Indicator */}
      <div className="px-4 md:px-10">
        <StepIndicator steps={steps} activeStep={activeStep} />
      </div>

      <form onSubmit={handleSubmit} className="bg-white">
        {/* 2. Standardized Grid Container for Steps 
            We wrap the steps in a div that forces a 2-column layout on desktop
        */}
        <div className="min-h-[300px]">
          {activeStep === 0 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <AccountStep
                formData={formData}
                onChange={onChange}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                showConfirmPassword={showConfirmPassword}
                setShowConfirmPassword={setShowConfirmPassword}
              />
            </div>
          )}

          {activeStep === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <PersonalInfoStep formData={formData} onChange={onChange} />
            </div>
          )}

          {activeStep === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <AddressStep
                formData={formData}
                onChange={onChange}
                acceptTerms={acceptTerms}
                onAcceptTermsChange={setAcceptTerms}
              />
            </div>
          )}
        </div>

        {/* 3. Footer Action Buttons - Wider and more distinct */}
        <div className="flex justify-between items-center pt-10 mt-10 border-t border-gray-100">
          {activeStep > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="px-8 rounded-xl border-gray-300"
              onClick={() => setActiveStep(activeStep - 1)}
            >
              ← Back
            </Button>
          ) : (
            <div />
          )}

          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            className="px-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            {isLoading
              ? "Processing..."
              : activeStep === steps.length - 1
              ? "Create Account"
              : "Continue →"}
          </Button>
        </div>
      </form>

      <div className="text-center">
        <p className="text-gray-500">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-blue-600 font-bold hover:underline"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
}
