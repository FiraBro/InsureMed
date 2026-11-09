import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PersonalInfoStep({ formData, onChange }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
          Phone Number
        </Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={onChange}
          placeholder="+1 (555) 000-0000"
          className="h-12 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="dateOfBirth"
            className="text-sm font-medium text-gray-700"
          >
            Date of Birth
          </Label>
          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={onChange}
            className="h-12 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
            Gender
          </Label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={onChange}
            className="flex h-12 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-gray-900 focus:ring-gray-900 focus:outline-none"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="profilePicture"
          className="text-sm font-medium text-gray-700"
        >
          Profile Picture (Optional)
        </Label>
        <Input
          id="profilePicture"
          name="profilePicture"
          type="file"
          accept="image/*"
          onChange={onChange}
          className="h-12 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
        />
      </div>
    </div>
  );
}
