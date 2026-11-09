import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { BsListCheck, BsCloudUpload, BsBarChartSteps } from "react-icons/bs";

const steps = [
  {
    title: "Choose Your Plan",
    description:
      "Browse our available insurance plans and pick the one that best fits your needs.",
    icon: <BsListCheck className="w-10 h-10 text-blue-600" />,
  },
  {
    title: "Upload Documents",
    description:
      "Submit the required documents securely using our online portal.",
    icon: <BsCloudUpload className="w-10 h-10 text-green-600" />,
  },
  {
    title: "Track Application",
    description:
      "Monitor your application status in real-time from your dashboard.",
    icon: <BsBarChartSteps className="w-10 h-10 text-purple-600" />,
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-gray-900 mb-6"
        >
          How It Works
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-gray-600 max-w-2xl mx-auto mb-14"
        >
          Follow these three simple steps to apply for your insurance plan.
        </motion.p>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl border border-gray-200">
                <CardContent className="p-8 space-y-6">
                  <div className="flex justify-center">{step.icon}</div>

                  <h3 className="text-xl font-semibold text-gray-900">
                    {step.title}
                  </h3>

                  <p className="text-gray-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
