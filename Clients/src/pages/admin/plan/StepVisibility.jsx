import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const StepVisibility = ({ form, update }) => {
  // Logic to determine if switches should look "on"
  const isPublished = form.status === "published";
  const isPopular = !!form.isPopular; // Ensures it's a boolean

  return (
    <Card className="border border-gray-200 shadow-none">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Plan Visibility</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Active Status Box */}
        <div
          onClick={() => update("status", isPublished ? "DRAFT" : "PUBLISHED")}
          className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
            isPublished
              ? "border-blue-600 bg-blue-50/30"
              : "border-gray-100 bg-transparent"
          }`}
        >
          <div className="space-y-1">
            <Label className="text-base font-semibold cursor-pointer">
              Live Status
            </Label>
            <p className="text-sm text-muted-foreground">
              {isPublished
                ? "This plan is currently set to Public."
                : "This plan is currently a Draft."}
            </p>
          </div>
          <Switch
            checked={isPublished}
            onCheckedChange={(checked) =>
              update("status", checked ? "PUBLISHED" : "DRAFT")
            }
          />
        </div>

        {/* Popular Tag Box */}
        <div
          onClick={() => update("isPopular", !isPopular)}
          className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
            isPopular
              ? "border-orange-500 bg-orange-50/30"
              : "border-gray-100 bg-transparent"
          }`}
        >
          <div className="space-y-1">
            <Label className="text-base font-semibold cursor-pointer">
              Feature as Popular
            </Label>
            <p className="text-sm text-muted-foreground">
              Add a "Most Popular" badge to this plan.
            </p>
          </div>
          <Switch
            checked={isPopular}
            onCheckedChange={(checked) => update("isPopular", checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default StepVisibility;
