import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";

const StepFeatures = ({ form, update }) => {
  // Pull features from the form object, default to empty array if undefined
  const features = form.features || [];

  const lightBorderStyle =
    "border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-gray-300";

  const addFeature = (e) => {
    e.preventDefault();
    // Updates the 'features' key in the parent form state
    update("features", [...features, ""]);
  };

  const updateFeature = (index, value) => {
    const updated = [...features];
    updated[index] = value;
    update("features", updated);
  };

  const removeFeature = (e, index) => {
    e.preventDefault();
    const updated = features.filter((_, i) => i !== index);
    // If you delete everything, we reset to one empty input so the screen isn't blank
    update("features", updated.length > 0 ? updated : [""]);
  };

  return (
    <div className="space-y-6">
      <Card className="border-gray-200 shadow-none">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Plan Features</CardTitle>
          <p className="text-sm text-muted-foreground">
            List the key benefits and features included in this plan.
          </p>
        </CardHeader>

        <CardContent className="space-y-3">
          {features.length > 0 ? (
            features.map((feature, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  className={lightBorderStyle}
                  placeholder={`Feature #${
                    index + 1
                  } (e.g. Free Dental Coverage)`}
                  value={feature}
                  onChange={(e) => updateFeature(index, e.target.value)}
                />
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  className="border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 shrink-0"
                  onClick={(e) => removeFeature(e, index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-lg">
              <p className="text-sm text-gray-400">No features added yet.</p>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed border-gray-300 text-gray-500 hover:bg-gray-50 hover:border-gray-400 mt-2"
            onClick={addFeature}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Feature
          </Button>
        </CardContent>
      </Card>

      {/* Example of how to add the Exclusions logic if needed */}
      <p className="text-xs text-muted-foreground px-1">
        Tip: Be specific with features to help users compare plans easily.
      </p>
    </div>
  );
};

export default StepFeatures;
