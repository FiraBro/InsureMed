import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Samuel Kebede",
    role: "Small Business Owner",
    image: "https://i.pravatar.cc/150?img=11",
    review:
      "The system made insurance applications effortless. Tracking my status in real-time saved me hours of follow-up.",
    rating: 5,
  },
  {
    name: "Abdi Mohammed",
    role: "High School Teacher",
    image: "https://i.pravatar.cc/150?img=12",
    review:
      "Incredibly intuitive! The platform feels very secure and the customer support was top-notch throughout.",
    rating: 5,
  },
  {
    name: "Hana Ali",
    role: "Digital Freelancer",
    image: "https://i.pravatar.cc/150?img=5",
    review:
      "Clean UI and fast processing. The status updates helped me stay informed through every single step.",
    rating: 5,
  },
];

export default function TestimonialsCarousel() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const next = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setDirection(-1);
    setIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  return (
    <section className="py-24 px-6 bg-white relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">
            Client Stories
          </h2>
        </div>

        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -10 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-col items-center text-center"
            >
              {/* Profile Image with Ring */}
              <div className="relative mb-8">
                <div className="absolute inset-0 rounded-full bg-blue-600/10 scale-125 animate-pulse" />
                <Avatar className="h-24 w-24 border-4 border-white shadow-xl relative z-10">
                  <AvatarImage src={testimonials[index].image} />
                  <AvatarFallback>{testimonials[index].name[0]}</AvatarFallback>
                </Avatar>
              </div>

              {/* Review Text - Now balanced and clamped */}
              <div className="max-w-2xl px-4">
                <Quote className="w-10 h-10 text-blue-600/20 mx-auto mb-6" />
                <p className="text-xl md:text-2xl font-medium text-gray-700 leading-snug md:leading-relaxed">
                  {testimonials[index].review}
                </p>

                <div className="mt-8">
                  <h4 className="text-lg font-bold text-gray-900">
                    {testimonials[index].name}
                  </h4>
                  <p className="text-sm text-blue-600 font-semibold uppercase tracking-widest mt-1">
                    {testimonials[index].role}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Minimal Controls */}
          <div className="flex justify-center items-center gap-12 mt-12">
            <button
              onClick={prev}
              className="p-3 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft size={28} />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 transition-all duration-300 rounded-full ${
                    index === i ? "w-8 bg-blue-600" : "w-2 bg-gray-200"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="p-3 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <ArrowRight size={28} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
