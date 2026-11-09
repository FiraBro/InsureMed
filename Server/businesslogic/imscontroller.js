// insurance.controller.js

const policyService = require("./policy.service");
const claimService = require("./claim.service");

class InsuranceController {
  createPolicy(policyData) {
    policyService.validatePolicy(policyData);

    const premium = policyService.calculatePremium(policyData);

    return {
      policyId: Date.now(),
      premium,
      status: "ACTIVE",
    };
  }

  submitClaim(claimData, policyData) {
    const result = claimService.evaluateClaim(claimData, policyData);

    return {
      claimId: Date.now(),
      ...result,
    };
  }
}

module.exports = new InsuranceController();
