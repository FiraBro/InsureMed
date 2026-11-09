import FAQ from "../models/faq.js";
export const createFAQ = async (data) => {
  return await FAQ.create(data);
};

export const updateFAQ = async (id, updateData) => {
  const faq = await FAQ.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!faq) throw new Error("FAQ not found");
  return faq;
};

export const getActiveFAQs = async () => {
  return await FAQ.find({ isActive: true }).sort({ category: 1 });
};
