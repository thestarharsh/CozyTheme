import { Link } from "wouter";
import { Smartphone, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Smartphone className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold">CozyGripz</span>
            </div>
            <p className="text-neutral-400 mb-4">
              Premium mobile covers and accessories for the modern lifestyle. Protect your device with style.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <span className="text-neutral-400 hover:text-white transition-colors cursor-pointer">
                    Home
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/products">
                  <span className="text-neutral-400 hover:text-white transition-colors cursor-pointer">
                    Products
                  </span>
                </Link>
              </li>
              <li>
                <span className="text-neutral-400 hover:text-white transition-colors cursor-pointer">
                  Categories
                </span>
              </li>
              <li>
                <span className="text-neutral-400 hover:text-white transition-colors cursor-pointer">
                  About Us
                </span>
              </li>
              <li>
                <span className="text-neutral-400 hover:text-white transition-colors cursor-pointer">
                  Contact
                </span>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-neutral-400 hover:text-white transition-colors cursor-pointer">
                  FAQ
                </span>
              </li>
              <li>
                <span className="text-neutral-400 hover:text-white transition-colors cursor-pointer">
                  Shipping Info
                </span>
              </li>
              <li>
                <span className="text-neutral-400 hover:text-white transition-colors cursor-pointer">
                  Returns
                </span>
              </li>
              <li>
                <span className="text-neutral-400 hover:text-white transition-colors cursor-pointer">
                  Size Guide
                </span>
              </li>
              <li>
                <span className="text-neutral-400 hover:text-white transition-colors cursor-pointer">
                  Support
                </span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-2 text-neutral-400">
              <li className="flex items-center">
                <span className="mr-2">📞</span>
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✉️</span>
                <span>support@cozygripz.com</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-1">📍</span>
                <span>123 Tech Street, Mumbai, Maharashtra 400001</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-700 mt-8 pt-8 text-center">
          <p className="text-neutral-400">
            © 2024 CozyGripz. All rights reserved. | Privacy Policy | Terms of Service
          </p>
        </div>
      </div>
    </footer>
  );
}
