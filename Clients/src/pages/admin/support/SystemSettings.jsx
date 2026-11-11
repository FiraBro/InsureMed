import React, { useState, useEffect } from "react";
import {
  FiSave,
  FiMail,
  FiGlobe,
  FiPercent,
  FiPower,
  FiLoader,
} from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { adminService } from "@/services/adminService";
import { toast } from "react-toastify";

export default function SystemSettings({ initialSettings, onUpdateSuccess }) {
  const [formData, setFormData] = useState(initialSettings || {});
  const [isSaving, setIsSaving] = useState(false);

  // Keep form in sync with server data refresh
  useEffect(() => {
    if (initialSettings) setFormData(initialSettings);
  }, [initialSettings]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await adminService.updateSettings(formData);
      toast.success("System configurations synchronized");
      if (onUpdateSuccess) onUpdateSuccess();
    } catch (err) {
      toast.error("Failed to update system settings");
    } finally {
      setIsSaving(false);
    }
  };

  const labelClass = "text-sm font-medium text-slate-700";
  const inputClass =
    "h-11 border-slate-300 bg-white pl-10 text-slate-900 focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600/20";

  return (
    <div className="max-w-2xl">
      <Card className="overflow-hidden rounded-xl border-slate-200 bg-white shadow-sm">
        <CardContent className="divide-y divide-slate-200 p-0">
          {/* Identity */}
          <section className="space-y-5 p-6">
            <div className="space-y-2">
              <label htmlFor="systemName" className={labelClass}>
                Agency Identity
              </label>
              <div className="relative">
                <FiGlobe className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  id="systemName"
                  value={formData.systemName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, systemName: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="contactEmail" className={labelClass}>
                Support Channel Email
              </label>
              <div className="relative">
                <FiMail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  id="contactEmail"
                  value={formData.contactEmail || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, contactEmail: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* Tax & status */}
          <section className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
            {/* Global Tax */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <label
                htmlFor="globalTaxRate"
                className="flex items-center gap-2 text-sm font-medium text-slate-700"
              >
                <FiPercent size={14} className="text-slate-400" />
                Global Tax
              </label>
              <Input
                id="globalTaxRate"
                type="number"
                value={formData.globalTaxRate || 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    globalTaxRate: Number(e.target.value),
                  })
                }
                className="mt-2 h-auto border-none bg-transparent p-0 text-3xl font-semibold tabular-nums text-slate-900 shadow-none focus-visible:ring-0"
              />
            </div>

            {/* Maintenance toggle */}
            <div
              className={`rounded-lg border p-4 transition-colors ${
                formData.maintenanceMode
                  ? "border-red-200 bg-red-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <label
                  htmlFor="maintenanceMode"
                  className="flex items-center gap-2 text-sm font-medium text-slate-700"
                >
                  <FiPower size={14} className="text-slate-400" />
                  Status
                </label>
                <input
                  id="maintenanceMode"
                  type="checkbox"
                  checked={formData.maintenanceMode || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maintenanceMode: e.target.checked,
                    })
                  }
                  className="h-5 w-5 cursor-pointer accent-red-600"
                />
              </div>
              <p
                className={`mt-3 text-sm font-semibold ${
                  formData.maintenanceMode ? "text-red-700" : "text-emerald-700"
                }`}
              >
                {formData.maintenanceMode
                  ? "MAINTENANCE ACTIVE"
                  : "SYSTEM LIVE"}
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="bg-slate-50 px-6 py-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="h-11 w-full gap-2 bg-blue-600 text-white hover:bg-blue-700 sm:w-auto sm:px-6"
            >
              {isSaving ? <FiLoader className="animate-spin" /> : <FiSave />}
              {isSaving ? "Syncing Logic..." : "Commit System Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
