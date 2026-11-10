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
