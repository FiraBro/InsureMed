import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEnterpriseDashboard } from "@/hooks/useAdmin";
import EnterpriseAnalytics from "./EnerpriseAnalytics";
import SystemSettings from "./SystemSettings";
import { FiBarChart2, FiSettings, FiActivity } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminControlCenter() {
  const { adminData, settings, isLoading, refresh } = useEnterpriseDashboard();
  // 1. Track active tab state manually for the animation key
  const [activeTab, setActiveTab] = useState("analytics");

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="h-12 w-12 rounded-full border-4 border-blue-600 border-t-transparent"
          />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
            Syncing Enterprise Data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10 font-manrope overflow-x-hidden">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* HEADER */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase leading-none">
              Control Center
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
              IMS Enterprise v2.0 • {settings?.systemName || "Standard Mode"}
            </p>
          </div>

          <button
            onClick={refresh}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all border border-gray-200"
          >
            <FiActivity className="text-blue-600" /> Live Refresh
          </button>
        </header>

        <Tabs
          defaultValue="analytics"
          onValueChange={setActiveTab}
          className="w-full space-y-8"
        >
          <TabsList className="relative h-14 w-fit items-center justify-start rounded-2xl bg-white p-1 shadow-sm border border-slate-100">
            <TabsTrigger
              value="analytics"
              className="relative z-10 flex items-center gap-2 px-8 py-3 rounded-xl data-[state=active]:text-white transition-colors duration-300 font-bold data-[state=active]:bg-blue-500"
            >
              <FiBarChart2 /> Business Intelligence
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="relative z-10 flex items-center gap-2 px-8 py-3 rounded-xl data-[state=active]:text-white transition-colors duration-300 font-bold data-[state=active]:bg-slate-900"
            >
              <FiSettings /> System Config
            </TabsTrigger>
          </TabsList>

          {/* 2. THE ANIMATION WRAPPER */}
          <div className="relative min-h-[500px]">
            <AnimatePresence mode="wait">
              {/* Use an internal loading state or the isLoading from your hook */}
              {isLoading ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-[2rem] z-50"
                >
                  <div className="h-10 w-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Fetching {activeTab} Data...
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === "analytics" ? (
                    <EnterpriseAnalytics data={adminData} />
                  ) : (
                    <SystemSettings
                      initialSettings={settings}
                      onUpdateSuccess={refresh}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
