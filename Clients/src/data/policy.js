let policies = [];
let nextPolicyId = 1000;


function create(policy) {
policy.policyId = nextPolicyId++;
policies.push(policy);
return policy;
}


function findById(id) {
return policies.find(p => p.policyId === id);
}


function update(id, updates) {
const policy = findById(id);
if (!policy) return null;


Object.assign(policy, updates);
return policy;
}


function getAll() {
return policies;
}


module.exports = {
create,
findById,
update,
getAll
};