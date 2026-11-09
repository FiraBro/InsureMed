export default function StepIndicator({ steps, activeStep }) {
  return (
    <div className="flex justify-between mb-8 relative w-full">
      {steps.map((step, i) => (
        <div key={i} className="flex flex-col items-center flex-1 relative">
          {/* Connector line except for the first step */}
          {i !== 0 && (
            <div
              className={`absolute top-4 left-0 h-0.5 transition-all duration-300 ${
                i <= activeStep ? "bg-blue-600" : "bg-gray-200"
              }`}
              style={{
                width: "100%",
                transform: "translateX(-50%)",
              }}
            ></div>
          )}

          {/* Step circle */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mb-2 z-10 transition-all duration-300 ${
              i <= activeStep
                ? "bg-blue-600 text-white border-2 border-blue-600"
                : "bg-white text-gray-400 border-2 border-gray-300"
            }`}
          >
            {i < activeStep ? "✓" : i + 1}
          </div>

          {/* Step label */}
          <span
            className={`text-xs font-medium tracking-wide ${
              i <= activeStep ? "text-gray-900" : "text-gray-400"
            }`}
          >
            {step}
          </span>
        </div>
      ))}
    </div>
  );
}
