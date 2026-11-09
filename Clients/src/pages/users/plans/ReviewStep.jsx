import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FiCheckCircle } from "react-icons/fi";
import { Card, CardContent } from "@/components/ui/card";

export default function ReviewStep({ formData, setFormData, policyDates }) {
  return (
    <div className="space-y-6">
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-center">
          <FiCheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <p className="text-sm text-green-800">
            Review all information before submitting your application
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-blue-500">
          <CardContent className="pt-6">
            <h4 className="font-semibold mb-4">Policy Period</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Start Date</span>
                <span>{new Date(policyDates.startDate).toDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">End Date</span>
                <span>{new Date(policyDates.endDate).toDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-500">
          <CardContent className="pt-6">
            <h4 className="font-semibold text-gray-900 mb-4">Personal Info</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Full Name</span>
                <span className="font-medium">
                  {formData.personal.fullName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email</span>
                <span className="font-medium">{formData.personal.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone</span>
                <span className="font-medium">{formData.personal.phone}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {formData.nominee.name && (
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-semibold text-gray-900 mb-4">
              Nominee Information
            </h4>
            <div className="space-y-2">
              <p>
                <span className="text-gray-600">Name: </span>
                <span className="font-medium">{formData.nominee.name}</span>
              </p>
              <p>
                <span className="text-gray-600">Relationship: </span>
                <span className="font-medium">
                  {formData.nominee.relationship}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="terms"
            checked={formData.agree}
            onCheckedChange={(val) =>
              setFormData((prev) => ({ ...prev, agree: val }))
            }
            className="mt-1"
          />
          <Label
            htmlFor="terms"
            className="text-sm leading-tight cursor-pointer"
          >
            I agree to the{" "}
            <a href="/terms" className="text-blue-600 hover:underline">
              Terms and Conditions
            </a>{" "}
            and confirm that all provided information is accurate to the best of
            my knowledge.
          </Label>
        </div>
      </div>
    </div>
  );
}
