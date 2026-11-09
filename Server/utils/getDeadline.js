const getDeadline = (priority) => {
  const hours = { URGENT: 2, HIGH: 24, MEDIUM: 48, LOW: 72 };
  return new Date(Date.now() + (hours[priority] || 48) * 60 * 60 * 1000);
};
export default getDeadline;
