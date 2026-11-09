import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiUser,
  FiCheckCircle,
  FiArrowRight,
  FiArrowLeft,
  FiHeart,
  FiDollarSign,
  FiFileText,
  FiShield,
  FiChevronRight,
} from "react-icons/fi";

// Integrated Hooks
import { usePlans } from "@/hooks/usePlan";
import { useApplications } from "@/hooks/useApplication";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import DocumentsStep from "./DocumentsStep";
import MedicalStep from "./MedicalStep";
import PaymentStep from "./PaymentStep";
import ReviewStep from "./ReviewStep";
import NomineeStep from "./NomineeStep";
import PersonalStep from "./PersonalStep";

const calculatePolicyDates = (frequency) => {
  const startDate = new Date();
  const endDate = new Date(startDate);
  switch (frequency) {
    case "monthly":
      endDate.setMonth(endDate.getMonth() + 1);
      break;
    case "quarterly":
      endDate.setMonth(endDate.getMonth() + 3);
      break;
    case "yearly":
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
    default:
      endDate.setMonth(endDate.getMonth() + 1);
  }
  return { startDate: startDate.toISOString(), endDate: endDate.toISOString() };
};

export default function ApplyPlan() {
  const { id: planId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // --- Logic Integration ---
  const { getPlanById } = usePlans();
  const { actions, isProcessing } = useApplications();
  const { data: planRes, isLoading: planLoading } = getPlanById(planId);
  const plan = planRes?.data;

  const [policyDates, setPolicyDates] = useState(() =>
    calculatePolicyDates("monthly")
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    personal: {},
    nominee: {},
    medical: {},
    files: [],
    payment: { frequency: "monthly", method: "bank" },
    agree: false,
  });

  const steps = [
    { id: 0, name: "Personal", icon: <FiUser /> },
    { id: 1, name: "Nominee", icon: <FiHeart /> },
    { id: 2, name: "Medical", icon: <FiShield /> },
    { id: 3, name: "Documents", icon: <FiFileText /> },
    { id: 4, name: "Payment", icon: <FiDollarSign /> },
    { id: 5, name: "Review", icon: <FiCheckCircle /> },
  ];

  useEffect(() => {
    setPolicyDates(calculatePolicyDates(formData.payment.frequency));
  }, [formData.payment.frequency]);

  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleFileChange = (files) => {
    setFormData((prev) => ({ ...prev, files: [...files] }));
  };

  const validateCurrentStep = () => {
    if (currentStep === 0) {
      if (
        !formData.personal.fullName ||
        !formData.personal.email ||
        !formData.personal.phone
      )
        return false;
    }
    if (currentStep === 1 && plan?.maxMembers > 1 && !formData.nominee.name)
      return false;
    if (currentStep === 5 && !formData.agree) return false;
    return true;
  };

  const nextStep = () => {
    if (validateCurrentStep())
      setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));
  const goToStep = (stepIndex) => {
    if (stepIndex <= currentStep) setCurrentStep(stepIndex);
  };

  const handleSubmit = async () => {
    const form = new FormData();
    form.append("personal", JSON.stringify(formData.personal));
    form.append("nominee", JSON.stringify(formData.nominee));
    form.append("medical", JSON.stringify(formData.medical));
    form.append("payment", JSON.stringify(formData.payment));
    form.append("planId", planId);
    form.append("agree", String(formData.agree));
    formData.files.forEach((file) => form.append("documents", file));

    try {
      await actions.apply(form);
      navigate("/my-applications");
    } catch (err) {
      console.log(err);
    }
  };

  if (planLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading plan details...</p>
        </div>
      </div>
    );

  if (!plan)
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center p-6">
          <FiShield className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Plan Not Found</h3>
          <Button onClick={() => navigate("/plans")}>Browse Plans</Button>
        </Card>
      </div>
    );

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Apply for Insurance
          </h1>
          <p className="text-gray-600">
            Complete your application in a few simple steps
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-2 border-blue-100 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Badge className="mb-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
                      {plan.premiumFrequency}
                    </Badge>
                    <h3 className="text-xl font-bold text-gray-900">
                      {plan.name}
                    </h3>
                  </div>
                  <FiShield className="w-8 h-8 text-blue-600" />
                </div>
                <div className="space-y-3 mt-6">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Premium</span>
                    <span className="font-semibold text-green-600 text-lg">
                      {plan.premium} / {plan.premiumFrequency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Coverage</span>
                    <span className="font-semibold">{plan.coverageAmount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100 shadow-lg">
              <CardContent className="pt-6">
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                <div className="space-y-2">
                  {steps.map((step) => (
                    <button
                      key={step.id}
                      onClick={() => goToStep(step.id)}
                      disabled={step.id > currentStep}
                      className={`w-full flex items-center p-3 rounded-lg transition-all ${
                        step.id === currentStep
                          ? "bg-blue-50 border border-blue-200"
                          : step.id < currentStep
                          ? "bg-green-50 border border-green-100"
                          : "bg-gray-50 opacity-50"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          step.id === currentStep
                            ? "bg-blue-600 text-white"
                            : step.id < currentStep
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {step.id < currentStep ? (
                          <FiCheckCircle className="w-4 h-4" />
                        ) : (
                          step.icon
                        )}
                      </div>
                      <div className="text-left">
                        <p
                          className={`font-medium ${
                            step.id === currentStep
                              ? "text-blue-700"
                              : step.id < currentStep
                              ? "text-green-700"
                              : "text-gray-600"
                          }`}
                        >
                          {step.name}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="shadow-lg border border-gray-200">
                <CardContent className="pt-8">
                  {currentStep === 0 && (
                    <PersonalStep
                      formData={formData}
                      handleChange={handleChange}
                    />
                  )}
                  {currentStep === 1 && (
                    <NomineeStep
                      formData={formData}
                      handleChange={handleChange}
                    />
                  )}
                  {currentStep === 2 && (
                    <MedicalStep
                      formData={formData}
                      handleChange={handleChange}
                    />
                  )}
                  {currentStep === 3 && (
                    <DocumentsStep
                      fileInputRef={fileInputRef}
                      formData={formData}
                      handleFileChange={handleFileChange}
                    />
                  )}
                  {currentStep === 4 && (
                    <PaymentStep
                      formData={formData}
                      handleChange={handleChange}
                      handleFileChange={handleFileChange}
                      plan={plan} // <--- Add this prop here
                    />
                  )}
                  {currentStep === 5 && (
                    <ReviewStep
                      formData={formData}
                      setFormData={setFormData}
                      policyDates={policyDates}
                    />
                  )}

                  <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 0 || isProcessing}
                    >
                      <FiArrowLeft className="mr-2" /> Previous
                    </Button>
                    {currentStep < steps.length - 1 ? (
                      <Button onClick={nextStep}>
                        Next Step <FiArrowRight className="ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={!formData.agree || isProcessing}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isProcessing ? (
                          "Submitting..."
                        ) : (
                          <>
                            <FiCheckCircle className="mr-2" /> Submit
                            Application
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
