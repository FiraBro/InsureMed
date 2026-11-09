import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function StepBasicInfo({ form, update }) {
  // Define a common style for the light gray border
  const borderStyle =
    "border-gray-200 focus:border-gray-300 focus:ring-gray-300";

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Basic Information</h2>

      <Input
        className={borderStyle}
        placeholder="Plan Name"
        value={form.name}
        onChange={(e) => update("name", e.target.value)}
      />

      <Input
        className={borderStyle}
        placeholder="Short Description"
        value={form.shortDescription}
        onChange={(e) => update("shortDescription", e.target.value)}
      />

      <Textarea
        className={borderStyle}
        placeholder="Full Description"
        value={form.description}
        onChange={(e) => update("description", e.target.value)}
      />
    </div>
  );
}
