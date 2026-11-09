import * as settingsService from "../services/settingService.js";

export const getSettings = async (req, res) => {
  const settings = await settingsService.fetchSettings();
  res.json(settings);
};

export const updateSettings = async (req, res) => {
  const updated = await settingsService.updateSystemSettings(
    req.body,
    req.user.id
  );
  res.json({ message: "Settings updated successfully", updated });
};
