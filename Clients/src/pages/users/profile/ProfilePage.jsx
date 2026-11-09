import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiShield,
  FiClock,
  FiCreditCard,
  FiEdit3,
  FiCheckCircle,
  FiBell,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [activeTab, setActiveTab] = useState("overview");

  // Mock User Data
  const user = {
    name: "Abebe Yosef",
    email: "abebe.yosef@example.com",
    phone: "+251 911 22 33 44",
    address: "Bole, Addis Ababa, Ethiopia",
    memberSince: "Jan 2024",
    status: "Active",
    policyCount: 3,
    totalCoverage: "$250,000",
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  const OverviewTabContent = () => (
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
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FiUser className="text-blue-600" /> Personal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <motion.div variants={itemVariants} className="space-y-2">
              <Label className="text-gray-500">Full Name</Label>
              <Input
                disabled={!isEditing}
                defaultValue={user.name}
                className="h-11 border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              />
            </motion.div>
            <motion.div variants={itemVariants} className="space-y-2">
              <Label className="text-gray-500">Email Address</Label>
              <Input
                disabled={!isEditing}
                defaultValue={user.email}
                className="h-11 border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              />
            </motion.div>
            <motion.div variants={itemVariants} className="space-y-2">
              <Label className="text-gray-500">Phone Number</Label>
              <Input
                disabled={!isEditing}
                defaultValue={user.phone}
                className="h-11 border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              />
            </motion.div>
            <motion.div variants={itemVariants} className="space-y-2">
              <Label className="text-gray-500">Address</Label>
              <Input
                disabled={!isEditing}
                defaultValue={user.address}
                className="h-11 border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              />
            </motion.div>
          </CardContent>
          {isEditing && (
            <div className="p-6 pt-0 flex justify-end">
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                Save Changes
              </Button>
            </div>
          )}
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
              <div className="text-4xl font-bold">{user.policyCount}</div>
              <p className="text-xs mt-2 opacity-70">Renewing in 45 days</p>
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
                {user.totalCoverage}
              </div>
              <div className="flex items-center gap-1 text-green-600 text-xs mt-1 font-medium">
                <FiCheckCircle /> Verified Assets
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
                    {user.memberSince}
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
            {[
              {
                title: "Policy Renewal",
                date: "2 days ago",
                desc: "Your Health Policy is up for renewal.",
              },
              {
                title: "Claim Approved",
                date: "1 week ago",
                desc: "Claim #CLM-990 was successfully processed.",
              },
            ].map((note, i) => (
              <div
                key={i}
                className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="h-2 w-2 mt-2 rounded-full bg-blue-600 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">{note.title}</p>
                  <p className="text-xs text-gray-500">{note.desc}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{note.date}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FiCreditCard className="text-emerald-500" /> Payment Methods /
              Coming soon...
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-dashed rounded-xl border-gray-200">
              <div className="flex items-center gap-4">
                <div className="bg-gray-900 p-2 rounded text-white font-bold text-[10px]">
                  VISA
                </div>
                <div>
                  <p className="text-sm font-medium">•••• 4242</p>
                  <p className="text-xs text-gray-500">Exp 12/26</p>
                </div>
              </div>
              <Badge variant="outline">Default</Badge>
            </div>
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
  );

  const DocumentsTabContent = () => (
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
          {[
            {
              name: "Health Insurance Policy.pdf",
              date: "Jan 15, 2024",
              size: "2.4 MB",
            },
            {
              name: "Vehicle Insurance Certificate.pdf",
              date: "Feb 28, 2024",
              size: "1.8 MB",
            },
            {
              name: "Life Insurance Terms.pdf",
              date: "Mar 10, 2024",
              size: "3.1 MB",
            },
          ].map((doc, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center border-gray-200 justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 font-bold">PDF</span>
                </div>
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-sm text-gray-500">
                    Uploaded {doc.date} • {doc.size}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className=" border-gray-400">
                Download
              </Button>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );

  const SecurityTabContent = () => (
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
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">
                  Add an extra layer of security
                </p>
              </div>
              <Button variant="outline">Enable</Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Login History</p>
                <p className="text-sm text-gray-500">Recent account activity</p>
              </div>
              <Button variant="ghost">View</Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Change Password</p>
                <p className="text-sm text-gray-500">
                  Last changed 3 months ago
                </p>
              </div>
              <Button variant="ghost">Update</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 lg:p-12">
      <motion.div
        className="max-w-6xl mx-auto space-y-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-6">
            <motion.div whileHover={{ scale: 1.05 }} className="relative">
              <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white shadow-xl">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback className="bg-blue-600 text-white text-3xl">
                  AY
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-1 right-1 h-6 w-6 bg-green-500 border-4 border-white rounded-full" />
            </motion.div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {user.name}
              </h1>
              <div className="flex items-center gap-2 text-gray-500">
                <FiMapPin />
                <span className="text-sm">{user.address}</span>
              </div>
              <Badge
                variant="secondary"
                className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none"
              >
                Gold Member
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
          onValueChange={handleTabChange}
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
            {activeTab === "overview" && <OverviewTabContent />}
            {activeTab === "documents" && <DocumentsTabContent />}
            {activeTab === "security" && <SecurityTabContent />}
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </div>
  );
}
