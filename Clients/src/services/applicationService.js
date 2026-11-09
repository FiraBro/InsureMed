import api from "../lib/axios";

// ==========================
// USER SERVICES
// ==========================

// Apply for a policy (multipart/form-data)
const applyForPolicy = async (formData) => {
  console.log("Token from localStorage:", localStorage.getItem("token"));
  const res = await api.post("/applications/apply", formData); // no manual headers
  return res.data;
};

// Get logged-in user's applications
const getMyApplications = async (params) => {
  const res = await api.get("/applications/my-applications", { params });
  console.log("getMyApplications response:", res);
  return res.data;
};

// ==========================
// ADMIN SERVICES
// ==========================

// List all applications (admin)
const listApplications = async (params) => {
  // We pass 'params' as the second argument to axios.get
  // This automatically turns { page: 1, search: 'muke' } into ?page=1&search=muke
  const res = await api.get("/applications", { params });
  return res.data;
};

// Approve application (admin)
const approveApplication = async (id) => {
  const res = await api.patch(`/applications/approve/${id}`);
  return res.data;
};

// Reject application (admin)
const rejectApplication = async (id) => {
  const res = await api.patch(`/applications/reject/${id}`);
  return res.data;
};

// Delete application (admin)
const deleteApplication = async (id) => {
  const res = await api.delete(`/applications/${id}`);
  return res.data;
};

export const applicationService = {
  applyForPolicy,
  getMyApplications,
  listApplications,
  approveApplication,
  rejectApplication,
  deleteApplication,
};
