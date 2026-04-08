'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Music2 } from 'lucide-react';

export function Footer() {
  const socialLinks = [
    {
      href: 'https://x.com/ProphetNamara',
      label: 'X (Twitter)',
      icon: <Twitter className="text-white w-4 h-4" />,
    },
    {
      href: 'https://www.facebook.com/ProphetNamara',
      label: 'Facebook',
      icon: <Facebook className="text-white w-4 h-4" />,
    },
    {
      href: 'https://www.instagram.com/prophetnamara/',
      label: 'Instagram',
      icon: <Instagram className="text-white w-4 h-4" />,
    },
    {
      href: 'https://www.youtube.com/channel/UCjF4Z56eCPD-gnWO1TOmFMQ',
      label: 'YouTube',
      icon: <Youtube className="text-white w-4 h-4" />,
    },
    {
      href: 'https://vm.tiktok.com/ZMSRsYWM1/',
      label: 'TikTok',
      icon: <Music2 className="text-white w-4 h-4" />,
    },
  ];

  const quickLinks = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Prophecies', href: '/prophecies' },
    { label: 'Testimonies', href: '/testimonies' },
    { label: "Prophet's Blog", href: '/blog' },
    { label: 'Spirit World', href: '/audio' },
    { label: 'Partnership', href: '/partnership' },
  ];

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Social Media Section */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4">Stay Connected</h3>
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Section */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-[#B28930] transition-colors block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Times Section */}
          <div>
            <h4 className="font-semibold mb-4">Service Times</h4>
            <div className="text-gray-300 space-y-2">
              <p>Every Saturday, 5 pm</p>
              <p>At Gardenia Hall, Imperial Royale Hotel</p>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Prophet Namara Ernest. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
