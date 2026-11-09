import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function AddressStep({
  formData,
  onChange,
  acceptTerms,
  onAcceptTermsChange,
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="street" className="text-sm font-medium text-gray-700">
            Street
          </Label>
          <Input
            id="street"
            name="address.street"
            value={formData.address.street}
            onChange={onChange}
            className="h-12 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city" className="text-sm font-medium text-gray-700">
            City
          </Label>
          <Input
            id="city"
            name="address.city"
            value={formData.address.city}
            onChange={onChange}
            className="h-12 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state" className="text-sm font-medium text-gray-700">
            State
          </Label>
          <Input
            id="state"
            name="address.state"
            value={formData.address.state}
            onChange={onChange}
            className="h-12 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zip" className="text-sm font-medium text-gray-700">
            ZIP Code
          </Label>
          <Input
            id="zip"
            name="address.zip"
            value={formData.address.zip}
            onChange={onChange}
            className="h-12 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
          />
        </div>
        <div className="space-y-2 col-span-2">
          <Label
            htmlFor="country"
            className="text-sm font-medium text-gray-700"
          >
            Country
          </Label>
          <Input
            id="country"
            name="address.country"
            value={formData.address.country}
            onChange={onChange}
            className="h-12 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
          />
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="terms"
            checked={acceptTerms}
            onChange={(e) => onAcceptTermsChange(e.target.checked)}
            className="w-4 h-4 text-gray-900 bg-gray-100 border-gray-300 rounded focus:ring-gray-900"
            required
          />
          <label htmlFor="terms" className="text-sm text-gray-600">
            I agree to the{" "}
            <Button
              variant="link"
              className="text-gray-900 font-semibold p-0 h-auto"
            >
              Terms of Service
            </Button>{" "}
            and{" "}
            <Button
              variant="link"
              className="text-gray-900 font-semibold p-0 h-auto"
            >
              Privacy Policy
            </Button>
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="newsletter"
            className="w-4 h-4 text-gray-900 bg-gray-100 border-gray-300 rounded focus:ring-gray-900"
          />
          <label htmlFor="newsletter" className="text-sm text-gray-600">
            Send me product updates and security tips
          </label>
        </div>
      </div>
    </div>
  );
}
