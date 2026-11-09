import React from "react";
import HowItWorks from "@/components/users/home/HowItWorks";
import HeroSection from "@/components/users/home/HeroSection";
import TestimonialsCarousel from "@/components/users/home/TestimonialsSection";
import FAQSection from "../../../components/users/home/FAQSection";
import PlansPreview from "@/components/users/home/PlanPreview";

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <PlansPreview />
      <HowItWorks />
      <FAQSection />
    </div>
  );
}
