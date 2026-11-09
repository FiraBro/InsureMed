import * as FAQService from "../services/faqService.js";

export const addFAQ = async (req, res) => {
  try {
    const faq = await FAQService.createFAQ(req.body);
    res.status(201).json({ success: true, data: faq });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const fetchFAQs = async (req, res) => {
  try {
    const faqs = await FAQService.getActiveFAQs();
    res.status(200).json({ success: true, data: faqs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const editFAQ = async (req, res) => {
  try {
    const faq = await FAQService.updateFAQ(req.params.id, req.body);
    res.status(200).json({ success: true, data: faq });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
