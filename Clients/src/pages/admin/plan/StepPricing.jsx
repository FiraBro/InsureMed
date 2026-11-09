import React from "react";
import { Input } from "@/components/ui/input";

export default function StepPricing({ form, update }) {
  // Defining a reusable style for the light gray border
  const inputStyles =
    "border-gray-200 focus:border-gray-300 focus:ring-gray-300";

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-500">Premium</label>
        <Input
          type="number"
          className={inputStyles}
          placeholder="0.00"
          value={form.premium}
          onChange={(e) => update("premium", +e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-500">
          Coverage Amount
        </label>
        <Input
          type="number"
          className={inputStyles}
          placeholder="0.00"
          value={form.coverageAmount}
          onChange={(e) => update("coverageAmount", +e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-500">Deductible</label>
        <Input
          type="number"
          className={inputStyles}
          placeholder="0.00"
          value={form.deductible}
          onChange={(e) => update("deductible", +e.target.value)}
        />
      </div>
    </div>
  );
}
