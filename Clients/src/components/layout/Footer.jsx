import React from "react";
import {
  Shield,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
  Facebook,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 to-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  Neural<span className="text-blue-600">Sure</span>
                </span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Your trusted partner for comprehensive insurance solutions.
                Protecting what matters most since 2010.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-gray-900 font-semibold text-lg mb-4">
                Quick Links
              </h3>
              <ul className="space-y-3">
                {["About Us", "Our Services", "Pricing", "Blog", "Careers"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
                      >
                        {item}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-gray-900 font-semibold text-lg mb-4">
                Support
              </h3>
              <ul className="space-y-3">
                {[
                  "Help Center",
                  "Contact Us",
                  "Privacy Policy",
                  "Terms of Service",
                  "FAQ",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-gray-900 font-semibold text-lg mb-4">
                Contact Us
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-600 text-sm">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <span>support@insurewise.com</span>
                </li>
                <li className="flex items-center gap-3 text-gray-600 text-sm">
                  <Phone className="h-4 w-4 text-blue-500" />
                  <span>+1 (800) 123-4567</span>
                </li>
                <li className="flex items-center gap-3 text-gray-600 text-sm">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span>123 Business Ave, Suite 100</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-600 text-sm">
              &copy; {currentYear} InsureWise. All rights reserved.
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://x.com/FiragosJemal"
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors duration-200"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 text-gray-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors duration-200"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span>24/7 Support Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
