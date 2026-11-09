import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FiUser, FiMail, FiPhone, FiCalendar } from "react-icons/fi";

export default function PersonalStep({ formData, handleChange }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="fullName" className="flex items-center gap-1 mb-2">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fullName"
            placeholder="John Doe"
            value={formData.personal.fullName || ""}
            onChange={(e) =>
              handleChange("personal", "fullName", e.target.value)
            }
            className="h-12 focus:ring-blue-400 border border-gray-200"
            leftIcon={<FiUser className="text-gray-400" />}
          />
        </div>
        <div>
          <Label htmlFor="email" className="flex items-center gap-1 mb-2">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="example@email.com"
            value={formData.personal.email || ""}
            onChange={(e) => handleChange("personal", "email", e.target.value)}
            className="h-12 focus:ring-blue-400 border border-gray-200"
            leftIcon={<FiMail className="text-gray-400" />}
          />
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <Label htmlFor="phone" className="flex items-center gap-1 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            placeholder="+2519XXXXXXXX"
            value={formData.personal.phone || ""}
            onChange={(e) => handleChange("personal", "phone", e.target.value)}
            className="h-12 focus:ring-blue-400 border border-gray-200"
            leftIcon={<FiPhone className="text-gray-400" />}
          />
        </div>
        <div>
          <Label htmlFor="dob" className="mb-2">
            Date of Birth
          </Label>
          <Input
            id="dob"
            type="date"
            value={formData.personal.dob || ""}
            onChange={(e) => handleChange("personal", "dob", e.target.value)}
            className="h-12 focus:ring-blue-400 border border-gray-200"
            leftIcon={<FiCalendar className="text-gray-400" />}
          />
        </div>
      </div>
    </div>
  );
}
