import api from "../lib/axios";

// ======================================================
// PUBLIC SERVICES
// ======================================================

// 1️⃣ List all published plans (public)
const listPlansPublic = async (query = {}) => {
  const res = await api.get("/plans", { params: query });
  return res.data;
};

// 2️⃣ Get popular plans (public)
const getPopularPlans = async () => {
  const res = await api.get("/plans/popular");
  return res.data;
};

// 3️⃣ Get premium stats (public)
const getPremiumStats = async () => {
  const res = await api.get("/plans/stats/premium");
  return res.data;
};

// 4️⃣ Get a plan by ID (public)
const getPlanById = async (id) => {
  const res = await api.get(`/plans/id/${id}`);
  return res.data;
};

// ======================================================
// ADMIN SERVICES (must be authenticated)
// ======================================================

// 1️⃣ List all plans (admin)
const listPlansAdmin = async (query = {}) => {
  const res = await api.get("/plans/admin", { params: query });
  return res.data;
};

// 2️⃣ Create a new plan
const createPlan = async (data) => {
  const res = await api.post("/plans", data);
  return res.data;
};

// 3️⃣ Update an existing plan
const updatePlan = async (id, data) => {
  const res = await api.patch(`/plans/${id}`, data);
  return res.data;
};

// 4️⃣ Soft delete a plan
const deletePlan = async (id) => {
  const res = await api.delete(`/plans/${id}`);
  return res.data;
};
const riskScore = async (data) => {
  const res = await api.post(`/plans/risk-score`, data);
  console.log("Risk Score Response:", res);
  return res.data;
};

export const planService = {
  // Public
  listPlansPublic,
  getPopularPlans,
  getPremiumStats,
  getPlanById,

  // Admin
  listPlansAdmin,
  createPlan,
  updatePlan,
  deletePlan,
  riskScore,
};
