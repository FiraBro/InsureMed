const POLICY_STATUSES = ["draft", "active", "expired", "cancelled"];
const CLAIM_STATUSES = ["filed", "approved", "rejected"];

function normalizePolicyInput(input) {
  return {
    holderName: String(input.holderName).trim(),
    type: input.type,
    coverageAmount: Number(input.coverageAmount),
    basePremium: Number(input.basePremium),
    claims: []
  };
}

function validatePolicy(policy) {
  if (!policy.holderName) throw new Error("Policy holder name required");
  if (policy.coverageAmount <= 0) throw new Error("Invalid coverage amount");
  if (policy.basePremium <= 0) throw new Error("Invalid premium");
}

function calculatePremium(policy) {
  let premium = policy.basePremium;

  // Risk multipliers
  if (policy.type === "health") premium *= 1.2;
  if (policy.type === "vehicle") premium *= 1.4;

  return Number(premium.toFixed(2));
}

function enrichPolicy(policy) {
  return {
    ...policy,
    premium: calculatePremium(policy),
    status: "draft",
    createdAt: new Date().toISOString()
  };
}

function validateStatusTransition(current, next) {
  const rules = {
    draft: ["active", "cancelled"],
    active: ["expired", "cancelled"],
    expired: [],
    cancelled: []
  };

  if (!rules[current].includes(next)) {
    throw new Error(`Invalid policy status change: ${current} → ${next}`);
  }
}

function validateClaim(claim) {
  if (!claim.amount || claim.amount <= 0) {
    throw new Error("Invalid claim amount");
  }
}

module.exports = {
  normalizePolicyInput,
  validatePolicy,
  enrichPolicy,
  validateStatusTransition,
  validateClaim,
  CLAIM_STATUSES,
  POLICY_STATUSES
};