import catchAsync from "../utils/catchAsync.js";
import claimService from "../services/claimService.js";
import NotificationService from "../services/notificationService.js";
// Create a new claim
export const createClaim = catchAsync(async (req, res) => {
  const documentUrl = req.file ? req.file.path : null;

  const claim = await claimService.createClaim(
    req.body,
    req.user.id,
    documentUrl
  );

  // Safety: Ensure we have the data needed for the template
  await NotificationService.trigger("CLAIM_RECEIVED", req.user.id, {
    id: claim.claimNumber || claim._id.toString(),
    policy: claim.policyType || "Insurance Policy",
  });

  res.status(201).json({ status: "success", data: claim });
});

// Update claim status (Admin Only)
export const updateStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const adminId = req.user._id;

  // 1. Get the UPDATED claim document
  const claim = await claimService.updateStatus(id, status, adminId);

  if (!claim) {
    return res.status(404).json({ success: false, message: "Claim not found" });
  }

  // 2. Identify the user (Check if your schema uses .user or .userId)
  const targetUserId = claim.userId || claim.user;

  // 3. Prepare notification data with fallbacks to avoid 'undefined'
  const notifData = {
    id: claim.claimNumber || claim._id.toString(),
    policy: claim.policyType || "Insurance Policy",
  };

  // 4. Trigger based on status
  if (targetUserId) {
    if (status === "approved") {
      await NotificationService.trigger(
        "CLAIM_APPROVED",
        targetUserId,
        notifData
      );
    } else if (status === "rejected") {
      await NotificationService.trigger(
        "CLAIM_REJECTED",
        targetUserId,
        notifData
      );
    }
  } else {
    console.error(
      "❌ Notification failed: No userId found on claim object",
      claim
    );
  }

  res.json({ success: true, claim });
});
export const getMyClaims = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search = "", status } = req.query;

  const result = await claimService.getMyClaims(req.user.id, {
    page: Number(page),
    limit: Number(limit),
    search: String(search),
    status: status,
  });

  res.status(200).json({
    status: "success",
    results: result.claims.length,
    data: result,
  });
});

export const getClaimById = catchAsync(async (req, res) => {
  const claim = await claimService.getClaimById(req.params.id, req.user.id);
  res.json({ status: "success", data: claim });
});

export const listAllClaims = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const result = await claimService.listAllClaims({
    page: Number(page),
    limit: Number(limit),
    search: search,
  });
  res.json({ status: "success", ...result });
});

export const softDeleteClaim = catchAsync(async (req, res) => {
  const claim = await claimService.softDeleteClaim(req.params.id, req.user.id);
  res.json({ status: "success", message: "Claim deleted", data: claim });
});
