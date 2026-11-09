import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const faqs = [
  {
    question: "How do I file a claim?",
    answer: (
      <div className="space-y-3">
        <p className="text-gray-600">
          You can start your claim process digitally in just a few steps:
        </p>
        <ol className="list-decimal pl-5 space-y-2 text-gray-700">
          <li>Log in to your secure account dashboard.</li>
          <li>
            Navigate to the{" "}
            <span className="font-medium text-blue-600">Claims Center</span>{" "}
            section.
          </li>
          <li>Select "File New Claim" and choose your policy type.</li>
          <li>Complete the digital form and upload supporting documents.</li>
          <li>Submit and track progress in real-time.</li>
        </ol>
      </div>
    ),
  },
  {
    question: "What documents are required for claim submission?",
    answer: (
      <ul className="list-disc pl-5 space-y-2 text-gray-700">
        <li>Completed and signed claim form</li>
        <li>Policy number and coverage verification</li>
        <li>Valid Government-issued ID (Passport or Driver's License)</li>
        <li>Original invoices or incident reports</li>
      </ul>
    ),
  },
  {
    question: "What is the typical claim processing timeframe?",
    answer: (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
        <div className="p-3 bg-green-50 rounded-lg border border-green-100">
          <p className="text-xs text-green-700 uppercase font-bold">Simple</p>
          <p className="text-lg font-semibold text-green-900">3-5 Days</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs text-blue-700 uppercase font-bold">Standard</p>
          <p className="text-lg font-semibold text-blue-900">5-10 Days</p>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
          <p className="text-xs text-purple-700 uppercase font-bold">Complex</p>
          <p className="text-lg font-semibold text-purple-900">15-30 Days</p>
        </div>
      </div>
    ),
  },
  {
    question: "How can I track my claim status in real-time?",
    answer: (
      <p className="text-gray-700 leading-relaxed">
        Our real-time tracker is available 24/7. Simply visit the
        <span className="font-semibold italic">
          {" "}
          Dashboard → My Claims
        </span>{" "}
        section to see exactly where your request stands in the pipeline.
      </p>
    ),
  },
  {
    question: "What options are available if my claim is denied?",
    answer: (
      <p className="text-gray-700 leading-relaxed">
        If your claim is denied, don't worry. You have the right to appeal. You
        can provide additional evidence or request a secondary review by a
        claims supervisor through our escalation portal.
      </p>
    ),
  },
];

export default function FAQSection() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="bg-white py-24 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6"
          >
            <HelpCircle size={16} />
            Support Center
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight"
          >
            Frequently Asked Questions
          </motion.h2>
        </div>

        {/* FAQ List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-0 border-t border-gray-200"
        >
          {faqs.map((faq, index) => {
            const isOpen = activeIndex === index;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="border-bottom border-gray-200"
                style={{ borderBottom: "1px solid #e5e7eb" }}
              >
                <button
                  onClick={() => setActiveIndex(isOpen ? null : index)}
                  className="w-full py-6 flex items-center justify-between text-left hover:bg-gray-50/50 transition-all px-2 rounded-lg"
                >
                  <span
                    className={`text-lg transition-colors duration-300 ${
                      isOpen ? "text-blue-600 font-medium" : "text-gray-800"
                    }`}
                  >
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    className={`p-1 rounded-full transition-colors ${
                      isOpen ? "bg-blue-100 text-blue-600" : "text-gray-400"
                    }`}
                  >
                    <ChevronDown size={20} />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: 0.3,
                        ease: [0.04, 0.62, 0.23, 0.98],
                      }}
                    >
                      <div className="pb-6 px-2 text-gray-600 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Footer Contact */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center text-gray-500 text-sm"
        >
          Still have questions?{" "}
          <button
            className="text-blue-600 font-semibold hover:underline cursor-pointer"
            onClick={() => navigate("/support")}
          >
            Contact our support team
          </button>
        </motion.p>
      </div>
    </section>
  );
}
