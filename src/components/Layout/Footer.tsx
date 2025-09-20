import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EZ</span>
              </div>
              <span className="font-bold text-xl">EZEXAM</span>
            </div>
            <p className="text-gray-400 text-sm">
              AI-powered exam preparation platform helping students excel in Math, Physics, and Chemistry.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/lessons" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Lessons
              </Link>
              <Link to="/mock-tests" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Mock Tests
              </Link>
              <Link to="/profile" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Profile
              </Link>
              <Link to="/help" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Help & Support
              </Link>
            </div>
          </div>

          {/* Subjects */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Member</h3>
            <div className="space-y-2">
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Phạm Hải Quân-SE183086
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Nguyễn Trần Khánh Kiên-SE183010
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Nguyễn Minh Trí-SE183033
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Nguyễn Bùi Bảo Long-SE183111
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Trần Minh Cường-SE183024
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-400">
                  123 Education Street<br />
                  Learning City, LC 12345<br />
                  United States
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">+1 (555) 123-EXAM</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">support@ezexam.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 EZEXAM. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors text-sm">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}