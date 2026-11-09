import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function PaymentStep({
  formData,
  handleChange,
  handleFileChange,
  plan,
}) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="frequency" className="mb-2">
          Payment Frequency
        </Label>
        <Select
          value={formData.payment.frequency}
          onValueChange={(val) => handleChange("payment", "frequency", val)}
          className="border border-gray-200 hover:border-gray-300 focus:border-blue-400 focus:ring focus:ring-blue-200 rounded-lg"
        >
          <SelectTrigger className="h-11 border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-md">
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bank Transfer Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6 space-y-4">
          <h4 className="font-semibold text-gray-900">Bank Transfer</h4>
          <p className="text-gray-600">
            Please transfer the total premium to the account below and upload a
            screenshot as proof.
          </p>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p>
              <span className="font-semibold">Bank:</span> ABC Bank
            </p>
            <p>
              <span className="font-semibold">Account Name:</span> XYZ Insurance
            </p>
            <p>
              <span className="font-semibold">Account Number:</span> 1234567890
            </p>
            <p>
              <span className="font-semibold">Branch:</span> Main Branch
            </p>
            <p>
              <span className="font-semibold">Amount:</span> {plan.premium} ETB
            </p>
          </div>

          {/* Upload Transfer Receipt */}
          <div className="mt-4">
            <Label className="mb-2">Upload Transfer Screenshot</Label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) =>
                handleFileChange([
                  ...formData.files,
                  ...Array.from(e.target.files),
                ])
              }
            />
            {formData.files.length > 0 && (
              <div className="mt-2 space-y-1">
                {formData.files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
