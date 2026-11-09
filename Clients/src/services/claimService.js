import api from "../lib/axios";

// ======================================================
// USER SERVICES
// ======================================================

// 1️⃣ Create a claim (with file upload)
const createClaim = async (formData) => {
  const res = await api.post("/claims/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  console.log("data fetch:", res.data);
  return res.data;
};

// 2️⃣ Get my claims (logged-in user)
const getMyClaims = async (query = {}) => {
  const res = await api.get("/claims/me", { params: query });
  console.log("getMyClaims response:", res);
  return res.data;
};

// 3️⃣ Get a specific claim by ID
const getClaimById = async (id) => {
  const res = await api.get(`/claims/${id}`);
  return res.data;
};

// ======================================================
// ADMIN SERVICES
// ======================================================

// 4️⃣ List all claims (admin) with pagination + search
const listAllClaims = async (query = {}) => {
  const res = await api.get("/claims", {
    params: query, // { page, limit, status, search }
  });
  return res.data;
};

// 5️⃣ Update claim status (Approved / Rejected / Processing)
const updateClaimStatus = async (id, status) => {
  const res = await api.put(`/claims/${id}/status`, { status });
  return res.data;
};

// 6️⃣ Soft delete claim (admin)
const softDeleteClaim = async (id) => {
  const res = await api.delete(`/claims/${id}`);
  return res.data;
};

export const claimService = {
  createClaim,
  getMyClaims,
  getClaimById,
  listAllClaims,
  updateClaimStatus,
  softDeleteClaim,
};
