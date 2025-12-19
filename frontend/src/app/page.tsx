'use client';

import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { ActionButtons } from './components/ActionButtons';
import { HeroCarousel } from './components/HeroCarousel';
import { TestimoniesCarousel } from './components/TestimoniesCarousel';
import { ShareStorySection } from './components/ShareStorySection';
import { FloatingContact } from './components/FloatingContact';
import { About } from './components/About';
import { Videos } from './components/Videos';
import { Testimonies } from './components/Testimonies';
import { Blog } from './components/Blog';
import { Audio } from './components/Audio';
import { Facebook, Twitter, Instagram, Youtube, Music2 } from 'lucide-react';

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState('Home');

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'About':
        return <About setCurrentPage={setCurrentPage} />;
      case 'Videos':
        return <Videos />;

      case 'Testimonies':
        return <Testimonies />;
      case 'Blog':
        return <Blog />;
      case 'Audio':
        return <Audio />;
      case 'Home':
      default:
        return (
          <>
            {/* Action Buttons */}

            {/* Hero Carousel */}
            <HeroCarousel />

            {/* Testimonies Section */}
            <TestimoniesCarousel />

            {/* Share Story Section */}
            <ShareStorySection />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Page Content */}
      {renderPage()}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold text-[#B28930] mb-4">Stay Connected</h3>
              <div className="flex space-x-4">
                <a
                  href="https://x.com/ProphetNamara"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter)"
                  className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition"
                >
                  <Twitter className="text-white w-4 h-4" />
                </a>
                <a
                  href="https://www.facebook.com/ProphetNamara"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition"
                >
                  <Facebook className="text-white w-4 h-4" />
                </a>
                <a
                  href="https://www.instagram.com/prophetnamara/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition"
                >
                  <Instagram className="text-white w-4 h-4" />
                </a>
                <a
                  href="https://www.youtube.com/channel/UCjF4Z56eCPD-gnWO1TOmFMQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition"
                >
                  <Youtube className="text-white w-4 h-4" />
                </a>
                <a
                  href="https://vm.tiktok.com/ZMSRsYWM1/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition"
                >
                  <Music2 className="text-white w-4 h-4" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <button
                    onClick={() => setCurrentPage('About')}
                    className="hover:text-[#B28930] transition-colors"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage('Videos')}
                    className="hover:text-[#B28930] transition-colors"
                  >
                    Prophecies
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage('Testimonies')}
                    className="hover:text-[#B28930] transition-colors"
                  >
                    Testimonies
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage('Blog')}
                    className="hover:text-[#B28930] transition-colors"
                  >
                    Prophet's Blog
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage('Audio')}
                    className="hover:text-[#B28930] transition-colors"
                  >
                    Spirit World
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Service Times</h4>
              <div className="text-gray-300 space-y-2">
                <p>Every Saturday, 5 pm</p>
                <p>At Gardenia Hall, Imperial Royale Hotel</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Prophet Namara Ernest. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating Contact Button */}
      <FloatingContact />
    </div>
  );
}
