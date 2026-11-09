// components/modals/PlanEditModal.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiTag, FiCpu } from "react-icons/fi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-toastify";
import { usePlans } from "@/hooks/usePlan";

/* ------------------ Anim Wrapper ------------------ */
const TabMotion = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    className="space-y-6"
  >
    {children}
  </motion.div>
);

/* ================= COMPONENT ================= */
export function PlanEditModal({ plan, isOpen, onClose, onSuccess }) {
  const { updatePlan, riskScore } = usePlans();
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [featureInput, setFeatureInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [formData, setFormData] = useState({});

  // ⚠ Initialize the riskScore hook at the top level
  const riskQuery = riskScore(formData);
  const { refetch: refetchRiskScore } = riskQuery;

  /* ------------------ INIT ------------------ */
  useEffect(() => {
    if (!plan) return;

    setFormData({
      ...plan,
      tags: plan.tags || [],
      features: plan.features || [],
      exclusions: plan.exclusions || [],
      keywords: plan.keywords || [],
    });
    setAiRecommendations(plan.recommendations || []);
  }, [plan]);

  const update = (k, v) => setFormData((p) => ({ ...p, [k]: v }));

  /* ------------------ SUBMIT ------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updatePlan.mutateAsync({ id: plan._id || plan.id, data: formData });
      toast("Plan updated successfully");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err.response?.data || err);
      toast(err.response?.data?.message || "Failed to update plan");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ AI RISK SCORE ------------------ */
  const handleRiskScore = async () => {
    setAiLoading(true);
    try {
      const { data } = await refetchRiskScore(); // ✅ manual fetch
      if (!data) throw new Error("No data returned");

      const { riskScore: score, recommendations } = data;
      update("riskScore", score);
      setAiRecommendations(recommendations || []);
      toast("Risk score calculated successfully");
    } catch (err) {
      console.error(err);
      toast("Failed to calculate risk");
    } finally {
      setAiLoading(false);
    }
  };

  if (!isOpen) return null;

  /* ================= RENDER ================= */
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold">Edit Insurance Plan</h2>
            <Button size="icon" variant="ghost" onClick={onClose}>
              <FiX />
            </Button>
          </div>

          {/* Body */}
          <form
            onSubmit={handleSubmit}
            className="overflow-y-auto max-h-[calc(90vh-80px)]"
          >
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="p-6"
            >
              <TabsList className="grid grid-cols-5 mb-6">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="coverage">Coverage</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              {/* ================= BASIC ================= */}
              <TabsContent value="basic">
                <TabMotion>
                  <Card className="p-6 border border-slate-200">
                    {/* Name, Category, Short Description, Tags */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={formData.name || ""}
                          onChange={(e) => update("name", e.target.value)}
                          className="border-slate-200 mt-1"
                        />
                      </div>

                      <div>
                        <Label>Category</Label>
                        <Input
                          value={formData.category || ""}
                          onChange={(e) => update("category", e.target.value)}
                          className="border-slate-200 mt-1"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label>Short Description</Label>
                        <Textarea
                          value={formData.shortDescription || ""}
                          onChange={(e) =>
                            update("shortDescription", e.target.value)
                          }
                          className="border-slate-200 mt-1"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label>Tags</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            className="border-slate-200"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              if (!tagInput.trim()) return;
                              update("tags", [
                                ...formData.tags,
                                tagInput.trim(),
                              ]);
                              setTagInput("");
                            }}
                          >
                            <FiTag />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {formData.tags?.map((t) => (
                            <Badge key={t} variant="outline">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </TabMotion>
              </TabsContent>

              {/* ================= PRICING ================= */}
              <TabsContent value="pricing">
                <TabMotion>
                  <Card className="p-6 border border-slate-200">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label>Premium</Label>
                        <Input
                          type="number"
                          value={formData.premium || 0}
                          onChange={(e) =>
                            update("premium", Number(e.target.value))
                          }
                          className="border-slate-200 mt-1"
                        />
                      </div>

                      <div>
                        <Label>Frequency</Label>
                        <Select
                          value={formData.premiumFrequency}
                          onValueChange={(v) => update("premiumFrequency", v)}
                        >
                          <SelectTrigger className="border-slate-200 mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="annually">Annually</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Deductible</Label>
                        <Input
                          type="number"
                          value={formData.deductible || 0}
                          onChange={(e) =>
                            update("deductible", Number(e.target.value))
                          }
                          className="border-slate-200 mt-1"
                        />
                      </div>

                      <div>
                        <Label>Discount (%)</Label>
                        <Input
                          type="number"
                          value={formData.discountPercentage || 0}
                          onChange={(e) =>
                            update("discountPercentage", Number(e.target.value))
                          }
                          className="border-slate-200 mt-1"
                        />
                      </div>
                    </div>
                  </Card>
                </TabMotion>
              </TabsContent>

              {/* ================= COVERAGE ================= */}
              <TabsContent value="coverage">
                <TabMotion>
                  <Card className="p-6 border border-slate-200">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label>Coverage Amount</Label>
                        <Input
                          type="number"
                          value={formData.coverageAmount || 0}
                          onChange={(e) =>
                            update("coverageAmount", Number(e.target.value))
                          }
                          className="border-slate-200 mt-1"
                        />
                      </div>

                      <div>
                        <Label>Network Size</Label>
                        <Input
                          value={formData.networkSize || ""}
                          onChange={(e) =>
                            update("networkSize", e.target.value)
                          }
                          className="border-slate-200 mt-1"
                        />
                      </div>

                      <div>
                        <Label>Claim Ratio (%)</Label>
                        <Input
                          type="number"
                          value={formData.claimSettlementRatio || 0}
                          onChange={(e) =>
                            update(
                              "claimSettlementRatio",
                              Number(e.target.value)
                            )
                          }
                          className="border-slate-200 mt-1"
                        />
                      </div>

                      <div>
                        <Label>Avg Claim Time (days)</Label>
                        <Input
                          type="number"
                          value={formData.averageClaimTime || 0}
                          onChange={(e) =>
                            update("averageClaimTime", Number(e.target.value))
                          }
                          className="border-slate-200 mt-1"
                        />
                      </div>
                    </div>
                  </Card>
                </TabMotion>
              </TabsContent>

              {/* ================= FEATURES ================= */}
              <TabsContent value="features">
                <TabMotion>
                  <Card className="p-6 border border-slate-200">
                    <Label>Add Feature</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        className="border-slate-200"
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          if (!featureInput.trim()) return;
                          update("features", [
                            ...formData.features,
                            featureInput.trim(),
                          ]);
                          setFeatureInput("");
                        }}
                      >
                        Add
                      </Button>
                    </div>

                    <ul className="mt-4 space-y-2">
                      {formData.features?.map((f) => (
                        <li
                          key={f}
                          className="p-3 border border-slate-200 rounded-lg"
                        >
                          {f}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </TabMotion>
              </TabsContent>

              {/* ================= ADVANCED ================= */}
              <TabsContent value="advanced">
                <TabMotion>
                  <Card className="p-6 border border-slate-200 space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label>Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(v) => update("status", v)}
                        >
                          <SelectTrigger className="border-slate-200 mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PUBLISHED">Published</SelectItem>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Risk Score</Label>
                        <Input
                          type="number"
                          value={formData.riskScore || 0}
                          readOnly
                          className="border-slate-200 mt-1 bg-slate-50"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2 flex items-center gap-2"
                          onClick={handleRiskScore}
                          disabled={aiLoading}
                        >
                          {aiLoading ? "Calculating..." : "Calculate AI Risk"}
                          <FiCpu />
                        </Button>

                        {aiRecommendations.length > 0 && (
                          <ul className="mt-2 list-disc pl-5 text-sm text-slate-600">
                            {aiRecommendations.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="flex justify-between items-center p-4 border border-slate-200 rounded-lg">
                        <span>Featured</span>
                        <Switch
                          checked={formData.isFeatured}
                          onCheckedChange={(v) => update("isFeatured", v)}
                        />
                      </div>

                      <div className="flex justify-between items-center p-4 border border-slate-200 rounded-lg">
                        <span>Popular</span>
                        <Switch
                          checked={formData.isPopular}
                          onCheckedChange={(v) => update("isPopular", v)}
                        />
                      </div>
                    </div>
                  </Card>
                </TabMotion>
              </TabsContent>

              {/* Footer */}
              <div className="flex justify-end gap-3 border-t border-slate-200 p-6">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Plan"}
                </Button>
              </div>
            </Tabs>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
