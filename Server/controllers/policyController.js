import policyService from "../services/policyService.js";
import catchAsync from "../utils/catchAsync.js";
import NotificationService from "../services/notificationService.js";

// ==================================================
// USER: GET MY POLICIES
// ==================================================
export const getMyPolicies = catchAsync(async (req, res) => {
  const { page, limit, search } = req.query;

  const result = await policyService.getMyPolicies(req.user.id, {
    page: page || 1,
    limit: limit || 10,
    search: search || "",
  });

  res.status(200).json({
    status: "success",
    results: result.applications.length,
    data: {
      applications: result.applications,
      pagination: result.pagination,
    },
  });
});

// ==================================================
// USER: REQUEST POLICY RENEWAL
// ==================================================
export const requestPolicyRenewal = catchAsync(async (req, res) => {
  const { paymentReference } = req.body;

  const result = await policyService.requestRenewal(
    req.params.id,
    req.user.id,
    paymentReference
  );

  // AUTOMATION: Notify user that renewal request is being processed
  await NotificationService.trigger("RENEWAL_REQUESTED", req.user.id, {
    policyNumber: result.policyNumber || result._id,
    amount: result.premiumAmount,
  });

  res.status(200).json({
    status: "success",
    message: "Renewal request submitted successfully. Awaiting admin approval.",
    data: result,
  });
});

// ==================================================
// ADMIN: APPROVE POLICY RENEWAL
// ==================================================
export const approvePolicyRenewal = catchAsync(async (req, res) => {
  const { newEndDate } = req.body;

  const policy = await policyService.renewPolicy(
    req.params.id,
    newEndDate,
    req.user.id
  );

  // AUTOMATION: Notify user that their policy is officially extended
  await NotificationService.trigger("POLICY_RENEWED", policy.userId, {
    policyNumber: policy.policyNumber,
    endDate: newEndDate,
  });

  res.status(200).json({
    status: "success",
    message: "Policy renewed successfully",
    data: policy,
  });
});

// ==================================================
// ADMIN: UPDATE POLICY STATUS
// ==================================================
export const updatePolicyStatus = catchAsync(async (req, res) => {
  const { status } = req.body;

  const updated = await policyService.updateStatus(
    req.params.id,
    status,
    req.user.id
  );

  // AUTOMATION: General status update (e.g., Active, Suspended)
  await NotificationService.trigger("POLICY_STATUS_CHANGED", updated.userId, {
    policyNumber: updated.policyNumber,
    newStatus: status.toUpperCase(),
  });

  res.status(200).json({
    status: "success",
    message: "Policy status updated successfully",
    data: updated,
  });
});

// ==================================================
// ADMIN: CANCEL POLICY
// ==================================================
export const cancelPolicy = catchAsync(async (req, res) => {
  const { reason } = req.body;

  const policy = await policyService.cancelPolicy(
    req.params.id,
    reason,
    req.user.id
  );

  // AUTOMATION: Critical notification for loss of coverage
  await NotificationService.trigger("POLICY_CANCELLED", policy.userId, {
    policyNumber: policy.policyNumber,
    reason: reason || "Administrative decision",
  });

  res.status(200).json({
    status: "success",
    message: "Policy cancelled successfully",
    data: policy,
  });
});

// Remaining controllers (getPolicyById, listPolicies, deletePolicy)
// usually don't require notifications as they are read-only or administrative.
export const getPolicyById = catchAsync(async (req, res) => {
  const policy = await policyService.getPolicyById(req.params.id);
  res.status(200).json({ status: "success", data: policy });
});

export const listPolicies = catchAsync(async (req, res) => {
  const { page, limit, search, category } = req.query;
  const data = await policyService.listPolicies({
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    search: search || "",
    category: category || "",
  });
  res.status(200).json({ status: "success", ...data });
});

export const deletePolicy = catchAsync(async (req, res) => {
  const deleted = await policyService.softDeletePolicy(
    req.params.id,
    req.user.id
  );
  res
    .status(200)
    .json({ status: "success", message: "Policy deleted", data: deleted });
});
