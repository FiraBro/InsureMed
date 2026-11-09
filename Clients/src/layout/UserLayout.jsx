import React from "react";
import Navbar from "../components/layout/Navbar";
import { Outlet } from "react-router-dom";
import Footer from "../components/layout/Footer";
import { PageTransition } from "@/components/common/PageTransition";

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Main content area with margin top */}
      <main className="flex-grow mt-16">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      <Footer />
    </div>
  );
}
