// claim.service.js

class ClaimService {
  evaluateClaim(claim, policy) {
    this.validateClaim(claim, policy);

    const fraudScore = this.detectFraud(claim);

    if (fraudScore > 70) {
      return {
        status: "REJECTED",
        reason: "High fraud risk",
      };
    }

    const approvedAmount = this.calculatePayout(claim, policy);

    return {
      status: "APPROVED",
      approvedAmount,
    };
  }

  validateClaim(claim, policy) {
    if (!claim.amount || !claim.reason) {
      throw new Error("Invalid claim data");
    }

    if (claim.amount > policy.coverageAmount) {
      throw new Error("Claim exceeds coverage");
    }
  }

  detectFraud(claim) {
    let score = 0;

    if (claim.amount > 0.8 * claim.policyCoverage) score += 40;
    if (claim.submittedDaysAfterIncident > 30) score += 20;
    if (claim.customerPreviousClaims > 3) score += 30;

    return score;
  }

  calculatePayout(claim, policy) {
    const deductible = policy.deductible || 500;
    return Math.max(claim.amount - deductible, 0);
  }
}

module.exports = new ClaimService();
