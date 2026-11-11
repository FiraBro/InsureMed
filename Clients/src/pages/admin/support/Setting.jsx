import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useEnterpriseDashboard } from "@/hooks/useAdmin";
import EnterpriseAnalytics from "./EnerpriseAnalytics";
import SystemSettings from "./SystemSettings";
import { FiBarChart2, FiSettings, FiActivity, FiLoader } from "react-icons/fi";

export default function AdminControlCenter() {
  const { adminData, settings, isLoading, refresh } = useEnterpriseDashboard();
  const [activeTab, setActiveTab] = useState("analytics");

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <FiLoader className="animate-spin text-blue-600" size={32} />
          <p className="text-sm text-slate-500">Syncing Enterprise Data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 px-4 py-8 md:px-8">
      <div className="w-full space-y-6">
        {/* Header */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Control Center
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              IMS Enterprise v2.0 • {settings?.systemName || "Standard Mode"}
            </p>
          </div>

          <Button
            variant="outline"
            onClick={refresh}
            className="h-10 gap-2 border-slate-300 bg-white px-4 text-sm text-slate-700 hover:bg-slate-50"
          >
            <FiActivity className="text-blue-600" /> Live Refresh
          </Button>
        </header>

        <Tabs
          defaultValue="analytics"
          onValueChange={setActiveTab}
          className="w-full space-y-6"
        >
          <TabsList className="h-10 w-fit justify-start rounded-lg bg-slate-100 p-1">
            <TabsTrigger
              value="analytics"
              className="gap-2 rounded-md px-5 text-sm text-slate-600 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
            >
              <FiBarChart2 /> Business Intelligence
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="gap-2 rounded-md px-5 text-sm text-slate-600 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
            >
              <FiSettings /> System Config
            </TabsTrigger>
          </TabsList>

          <div className="min-h-[500px]">
            {activeTab === "analytics" ? (
              <EnterpriseAnalytics data={adminData} />
            ) : (
              <SystemSettings
                initialSettings={settings}
                onUpdateSuccess={refresh}
              />
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
