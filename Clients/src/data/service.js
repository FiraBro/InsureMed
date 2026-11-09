const store = require("../data/policy.store");
const handler = require("../handlers/policyData.handler");

function createPolicy(rawInput) {
  const normalized = handler.normalizePolicyInput(rawInput);
  handler.validatePolicy(normalized);

  const enriched = handler.enrichPolicy(normalized);
  return store.create(enriched);
}

function activatePolicy(policyId) {
  const policy = store.findById(policyId);
  if (!policy) throw new Error("Policy not found");

  handler.validateStatusTransition(policy.status, "active");
  return store.update(policyId, { status: "active" });
}

function fileClaim(policyId, claimData) {
  const policy = store.findById(policyId);
  if (!policy) throw new Error("Policy not found");

  handler.validateClaim(claimData);

  const claim = {
    claimId: policy.claims.length + 1,
    amount: claimData.amount,
    status: "filed",
    filedAt: new Date().toISOString()
  };

  policy.claims.push(claim);

  // Risk-based premium increase
  policy.premium = Number((policy.premium * 1.1).toFixed(2));

  return claim;
}

function getPolicyAnalytics() {
  const policies = store.getAll();

  const activeCount = policies.filter(p => p.status === "active").length;
  const totalPremium = policies.reduce((sum, p) => sum + p.premium, 0);

  return {
    totalPolicies: policies.length,
    activePolicies: activeCount,
    totalPremiumCollected: totalPremium
  };
}

module.exports = {
  createPolicy,
  activatePolicy,
  fileClaim,
  getPolicyAnalytics
};