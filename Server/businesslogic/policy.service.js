// policy.service.js

class PolicyService {
  calculatePremium(policy) {
    const baseRate = this.getBaseRate(policy.type);
    const riskFactor = this.getRiskFactor(policy.customer);
    const coverageFactor = policy.coverageAmount / 10000;

    const premium = baseRate * riskFactor * coverageFactor;

    return Number(premium.toFixed(2));
  }

  getBaseRate(type) {
    const rates = {
      health: 120,
      vehicle: 150,
      property: 180,
      life: 200,
    };

    if (!rates[type]) {
      throw new Error("Invalid policy type");
    }

    return rates[type];
  }

  getRiskFactor(customer) {
    let risk = 1;

    if (customer.age > 60) risk += 0.4;
    if (customer.hasChronicDisease) risk += 0.6;
    if (customer.previousClaims > 2) risk += 0.5;

    return risk;
  }

  validatePolicy(policy) {
    if (!policy.customer || !policy.coverageAmount) {
      throw new Error("Policy data incomplete");
    }

    if (policy.coverageAmount < 10000) {
      throw new Error("Coverage amount too low");
    }

    return true;
  }
}

module.exports = new PolicyService();
