import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FiShield } from "react-icons/fi";
export default function MedicalStep({ formData, handleChange }) {
  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 p-4 rounded-lg">
        <div className="flex items-center">
          <FiShield className="w-5 h-5 text-yellow-600 mr-2" />
          <p className="text-sm text-yellow-800">
            Please provide accurate medical information for proper coverage
            assessment
          </p>
        </div>
      </div>
      <div>
        <Label htmlFor="medicalHistory" className="mb-2">
          Medical History
        </Label>
        <Textarea
          id="medicalHistory"
          placeholder="Describe any pre-existing conditions, current medications, allergies, or past surgeries..."
          value={formData.medical.history || ""}
          onChange={(e) => handleChange("medical", "history", e.target.value)}
          className="min-h-[150px] focus:ring-blue-400 border border-gray-200"
        />
        <p className="text-xs text-gray-500 mt-2">
          This information helps us provide you with the best coverage options
        </p>
      </div>
    </div>
  );
}
