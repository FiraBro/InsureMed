import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { FiHeart } from "react-icons/fi";

export default function NomineeStep({ formData, handleChange }) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center">
          <FiHeart className="w-5 h-5 text-blue-600 mr-2" />
          <p className="text-sm text-blue-800">
            Add a nominee to receive benefits in case of unforeseen
            circumstances
          </p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="nomineeName" className="mb-2">
            Nominee Full Name
          </Label>
          <Input
            id="nomineeName"
            placeholder="Jane Doe"
            value={formData.nominee.name || ""}
            onChange={(e) => handleChange("nominee", "name", e.target.value)}
            className="h-12 focus:ring-blue-400 border border-gray-200"
          />
        </div>
        <div>
          <Label htmlFor="relationship" className="mb-2">
            Relationship
          </Label>
          <Select
            value={formData.nominee.relationship || ""}
            onValueChange={(val) =>
              handleChange("nominee", "relationship", val)
            }
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select relationship" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-100">
              <SelectItem value="spouse">Spouse</SelectItem>
              <SelectItem value="child">Child</SelectItem>
              <SelectItem value="parent">Parent</SelectItem>
              <SelectItem value="sibling">Sibling</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
