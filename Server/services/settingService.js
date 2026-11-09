import setting from "../models/setting.js";
export const fetchSettings = async () => {
  // Always find the first document (Singleton pattern)
  return (await setting.findOne()) || (await setting.create({}));
};

export const updateSystemSettings = async (updateData, adminId) => {
  return await setting.findOneAndUpdate(
    {},
    { ...updateData, updatedBy: adminId },
    { new: true, upsert: true }
  );
};
