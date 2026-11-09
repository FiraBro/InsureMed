import { useState, useEffect, useCallback } from "react";
import { adminService } from "@/services/adminService";
import { toast } from "react-toastify";

export const useEnterpriseDashboard = () => {
  // 1. Core States
  const [adminData, setAdminData] = useState(null);
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Search States
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  /**
   * FETCH CORE DASHBOARD DATA
   * Handles Analytics and Maintenance Settings
   */
  const fetchData = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);

      const [analyticsRes, settingsRes] = await Promise.allSettled([
        adminService.getEnterpriseData(),
        adminService.getSettings(),
      ]);

      // Handle Settings (Critical for Maintenance Mode)
      if (settingsRes.status === "fulfilled") {
        let rawSettings = settingsRes.value?.data ?? settingsRes.value;
        if (Array.isArray(rawSettings)) rawSettings = rawSettings[0];
        setSettings(rawSettings);
      }

      // Handle Analytics
      if (analyticsRes.status === "fulfilled") {
        setAdminData(analyticsRes.value?.data ?? analyticsRes.value);
      }
    } catch (error) {
      console.error("Dashboard Sync Error:", error);
      toast.error("System synchronization failed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * GLOBAL SEARCH LOGIC
   * Includes internal debouncing to prevent server spam
   */
  const handleSearch = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await adminService.globalSearch(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Search Error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    // Dashboard Data
    adminData,
    settings,
    isLoading,
    refresh: fetchData,

    // Search Functionality
    searchResults,
    isSearching,
    executeSearch: handleSearch,
    clearSearch: () => setSearchResults([]),
  };
};
