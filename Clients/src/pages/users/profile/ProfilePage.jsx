import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser,
  FiMapPin,
  FiShield,
  FiClock,
  FiCreditCard,
  FiEdit3,
  FiCheckCircle,
  FiBell,
  FiLoader,
} from "react-icons/fi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/axios";
import { getMe } from "@/services/authService";

const formatMemberSince = (createdAt) => {
  if (!createdAt) return "—";
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
};

const formatCurrency = (amount, currency = "USD") => {
  if (amount == null || Number.isNaN(Number(amount))) return "$0";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

const formatRelativeDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getAddress = (address) => {
  if (typeof address === "string") return address;
  if (!address || typeof address !== "object") return "—";
  return (
    [address.street, address.city, address.state, address.country]
      .filter(Boolean)
      .join(", ") || "—"
  );
};

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.1, duration: 0.5 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

const tabContentVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2, ease: "easeInOut" },
  },
};

const tabTriggerVariants = {
  initial: { scale: 1 },
  tap: { scale: 0.95 },
};

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const account = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  // Backend data state
  const [profileData, setProfileData] = useState({
    stats: { activePolicies: 0, nextRenewalDays: null, totalCoverage: 0 },
    tier: "Standard Member",
    notifications: [],
    paymentMethods: [],
    documents: [],
    security: {
      twoFactorEnabled: false,
      lastPasswordChange: null,
    },
  });

  // Editable form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });

  // Sync form inputs whenever store account updates
  useEffect(() => {
    if (account) {
      setFormData({
        fullName: account.fullName || account.name || "",
        email: account.email || "",
        phone: account.phone || "",
        address: getAddress(account.address) === "—" ? "" : getAddress(account.address),
      });
    }
  }, [account]);

  // Fetch live profile & dashboard summary from backend
  useEffect(() => {
    const controller = new AbortController();

    async function fetchUserDashboard() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getMe();
        if (controller.signal.aborted) return;
        const data = response?.data?.data ?? response?.data ?? response;

        // Update auth store if backend returned fresh user details
        if (data.user && setUser) {
          setUser(data.user);
        }

        setProfileData({
          stats: {
            activePolicies: data.stats?.activePolicies ?? 0,
            nextRenewalDays: data.stats?.nextRenewalDays ?? null,
            totalCoverage: data.stats?.totalCoverage ?? 0,
          },
          tier: data.user?.membershipTier || data.tier || "Standard Member",
          notifications: Array.isArray(data.notifications) ? data.notifications : [],
          paymentMethods: Array.isArray(data.paymentMethods) ? data.paymentMethods : [],
          documents: Array.isArray(data.documents) ? data.documents : [],
          security: {
            twoFactorEnabled: Boolean(data.security?.twoFactorEnabled),
            lastPasswordChange: data.security?.lastPasswordChange || null,
          },
        });
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.response?.data?.message || err.message || "Could not load profile data.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserDashboard();
    return () => controller.abort();
  }, [setUser]);

  // Save edited personal details to backend
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const addressParts = (typeof account?.address === "object" && account?.address) || {};
      const response = await api.patch("/auth/me", {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: {
          ...addressParts,
          street: formData.address,
        },
      });
      const result = response?.data?.data ?? response?.data ?? response;
      setUser(result.user || { ...account, ...formData, address: { ...addressParts, street: formData.address } });
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Could not update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle2FA = async () => {
    try {
      const nextState = !profileData.security.twoFactorEnabled;
      await api.post("/auth/security/2fa", { enabled: nextState });

      setProfileData((prev) => ({
        ...prev,
        security: { ...prev.security, twoFactorEnabled: nextState },
      }));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Could not update two-factor settings.");
    }
  };

  const handleDownloadDocument = async (doc) => {
    if (doc.url) {
      window.open(doc.url, "_blank", "noopener,noreferrer");
      return;
    }
    try {
      const response = await api.get(`/documents/${doc.id}/download`, { responseType: "blob" });
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = doc.name || "document.pdf";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Could not download document.");
    }
  };

  const name = account?.fullName || account?.name || "User";
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const address = getAddress(account?.address);
  const memberSince = formatMemberSince(account?.createdAt);

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 lg:p-12">
      <motion.div
        className="max-w-6xl mx-auto space-y-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-6">
            <motion.div whileHover={{ scale: 1.05 }} className="relative">
              <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white shadow-xl">
                <AvatarImage src={account?.profilePicture || account?.avatar} />
                <AvatarFallback className="bg-blue-600 text-white text-3xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-1 right-1 h-6 w-6 bg-green-500 border-4 border-white rounded-full" />
            </motion.div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {name}
              </h1>
              <div className="flex items-center gap-2 text-gray-500">
                <FiMapPin />
                <span className="text-sm">{address}</span>
              </div>
              <Badge
                variant="secondary"
                className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none"
              >
                {profileData.tier}
              </Badge>
            </div>
          </div>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "outline" : "default"}
            className="flex items-center gap-2 border-blue-600 hover:border-blue-700"
          >
            <FiEdit3 /> {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>

        <Tabs
          defaultValue="overview"
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="bg-transparent border-b-gray-400 rounded-none w-full justify-start h-12 gap-8 p-0 mb-8">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none bg-transparent px-2 h-full shadow-none"
              asChild
            >
              <motion.div variants={tabTriggerVariants} whileTap="tap">
                Overview
              </motion.div>
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none bg-transparent px-2 h-full shadow-none"
              asChild
            >
              <motion.div variants={tabTriggerVariants} whileTap="tap">
                Documents
              </motion.div>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none bg-transparent px-2 h-full shadow-none"
              asChild
            >
              <motion.div variants={tabTriggerVariants} whileTap="tap">
                Security
              </motion.div>
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-8 outline-none"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Personal Details Card */}
                  <Card className="md:col-span-2 border-none shadow-sm bg-white">
                    <form onSubmit={handleSaveProfile}>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FiUser className="text-blue-600" /> Personal Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <motion.div
                          variants={itemVariants}
                          className="space-y-2"
                        >
                          <Label className="text-gray-500">Full Name</Label>
                          <Input
                            disabled={!isEditing}
                            value={formData.fullName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                fullName: e.target.value,
                              })
                            }
                            className="h-11 border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                          />
                        </motion.div>
                        <motion.div
                          variants={itemVariants}
                          className="space-y-2"
                        >
                          <Label className="text-gray-500">Email Address</Label>
                          <Input
                            type="email"
                            disabled={!isEditing}
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                            className="h-11 border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                          />
                        </motion.div>
                        <motion.div
                          variants={itemVariants}
                          className="space-y-2"
                        >
                          <Label className="text-gray-500">Phone Number</Label>
                          <Input
                            disabled={!isEditing}
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                phone: e.target.value,
                              })
                            }
                            className="h-11 border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                          />
                        </motion.div>
                        <motion.div
                          variants={itemVariants}
                          className="space-y-2"
                        >
                          <Label className="text-gray-500">Address</Label>
                          <Input
                            disabled={!isEditing}
                            value={formData.address}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                address: e.target.value,
                              })
                            }
                            className="h-11 border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                          />
                        </motion.div>
                      </CardContent>
                      {isEditing && (
                        <div className="p-6 pt-0 flex justify-end">
                          <Button
                            type="submit"
                            disabled={isSaving}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                          >
                            {isSaving ? (
                              <span className="flex items-center gap-2">
                                <FiLoader className="animate-spin" /> Saving...
                              </span>
                            ) : (
                              "Save Changes"
                            )}
                          </Button>
                        </div>
                      )}
                    </form>
                  </Card>

                  {/* Account Stats Bento Box */}
                  <div className="space-y-6">
                    <Card className="border-none shadow-sm bg-blue-600 text-white overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <FiShield size={80} />
                      </div>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium opacity-80 uppercase tracking-wider">
                          Active Policies
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold">
                          {isLoading ? "—" : profileData.stats.activePolicies}
                        </div>
                        <p className="text-xs mt-2 opacity-70">
                          {profileData.stats.nextRenewalDays != null
                            ? `Renewing in ${profileData.stats.nextRenewalDays} days`
                            : "No upcoming renewals"}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase">
                          Total Coverage
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                          {isLoading
                            ? "—"
                            : formatCurrency(profileData.stats.totalCoverage)}
                        </div>
                        <div className="flex items-center gap-1 text-green-600 text-xs mt-1 font-medium">
                          <FiCheckCircle />
                          {account?.isVerified ? "Verified account" : "Verification pending"}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500">
                              Member Since
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                              {memberSince}
                            </p>
                          </div>
                          <FiClock className="text-gray-300 h-8 w-8" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Quick Actions / Recent Activity Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FiBell className="text-orange-500" /> Notifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isLoading ? (
                        <p className="text-sm text-gray-400">
                          Loading notifications...
                        </p>
                      ) : profileData.notifications.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          You have no new notifications.
                        </p>
                      ) : (
                        profileData.notifications.map((note, i) => (
                          <div
                            key={note.id || i}
                            className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="h-2 w-2 mt-2 rounded-full bg-blue-600 shrink-0" />
                            <div>
                              <p className="font-semibold text-sm">
                                {note.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {note.description || note.desc}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-1">
                                {formatRelativeDate(
                                  note.createdAt || note.date,
                                )}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FiCreditCard className="text-emerald-500" /> Payment
                        Methods
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isLoading ? (
                        <p className="text-sm text-gray-400">
                          Loading payment methods...
                        </p>
                      ) : profileData.paymentMethods.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          No saved payment methods on file.
                        </p>
                      ) : (
                        profileData.paymentMethods.map((method, i) => (
                          <div
                            key={method.id || i}
                            className="flex items-center justify-between p-4 border border-dashed rounded-xl border-gray-200"
                          >
                            <div className="flex items-center gap-4">
                              <div className="bg-gray-900 p-2 rounded text-white font-bold text-[10px] uppercase">
                                {method.brand || "CARD"}
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  •••• {method.last4}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Exp {method.expMonth}/{method.expYear}
                                </p>
                              </div>
                            </div>
                            {method.isDefault && (
                              <Badge variant="outline">Default</Badge>
                            )}
                          </div>
                        ))
                      )}
                      <Button
                        variant="ghost"
                        className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm"
                      >
                        + Add New Payment Method
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeTab === "documents" && (
              <motion.div
                key="documents"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6 outline-none"
              >
                <Card className="md:col-span-2 border-none shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg">Your Documents</CardTitle>
                    <CardDescription>
                      All your insurance documents in one place
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isLoading ? (
                      <p className="text-sm text-gray-400">
                        Loading documents...
                      </p>
                    ) : profileData.documents.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No documents uploaded yet.
                      </p>
                    ) : (
                      profileData.documents.map((doc, i) => (
                        <motion.div
                          key={doc.id || i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center border-gray-200 justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                              <span className="text-red-600 font-bold text-xs uppercase">
                                {doc.fileType || "PDF"}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-sm text-gray-500">
                                Uploaded{" "}
                                {formatRelativeDate(doc.uploadedAt || doc.date)}
                                {doc.size ? ` • ${doc.size}` : ""}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-400"
                            onClick={() => handleDownloadDocument(doc)}
                          >
                            Download
                          </Button>
                        </motion.div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div
                key="security"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6 outline-none"
              >
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FiShield className="text-blue-600" /> Security Settings
                    </CardTitle>
                    <CardDescription>
                      Manage your account security and privacy
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            Two-Factor Authentication
                          </p>
                          <p className="text-sm text-gray-500">
                            {profileData.security.twoFactorEnabled
                              ? "Two-factor authentication is currently active"
                              : "Add an extra layer of security"}
                          </p>
                        </div>
                        <Button variant="outline" onClick={handleToggle2FA}>
                          {profileData.security.twoFactorEnabled
                            ? "Disable"
                            : "Enable"}
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Login History</p>
                          <p className="text-sm text-gray-500">
                            Recent account activity
                          </p>
                        </div>
                        <Button variant="ghost">View</Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Change Password</p>
                          <p className="text-sm text-gray-500">
                            {profileData.security.lastPasswordChange
                              ? `Last changed ${formatRelativeDate(
                                  profileData.security.lastPasswordChange,
                                )}`
                              : "Update your account password"}
                          </p>
                        </div>
                        <Button variant="ghost">Update</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </div>
  );
}
