'use client';

import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { ActionButtons } from './components/ActionButtons';
import { HeroCarousel } from './components/HeroCarousel';
import { TestimoniesCarousel } from './components/TestimoniesCarousel';
import { ShareStorySection } from './components/ShareStorySection';
import { FloatingContact } from './components/FloatingContact';
import { About } from './components/About';
import { Videos } from './components/Videos';
import { Blog } from './components/Blog';
import { Audio } from './components/Audio';

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState('Home');

  const renderPage = () => {
    switch (currentPage) {
      case 'About':
        return <About />;
      case 'Videos':
        return <Videos />;
      case 'Blog':
        return <Blog />;
      case 'Audio':
        return <Audio />;
      case 'Home':
      default:
        return (
          <>
            {/* Action Buttons */}
            <ActionButtons />
            
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
              <h3 className="text-2xl font-bold text-[#B28930] mb-4">Grace Church</h3>
              <p className="text-gray-300 mb-4">
                A community of faith, hope, and love. Join us as we grow together in Christ and serve our community with compassion and purpose.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">f</span>
                </div>
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">t</span>
                </div>
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">@</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-300">
                <li><button onClick={() => setCurrentPage('About')} className="hover:text-[#B28930] transition-colors">About Us</button></li>
                <li><button onClick={() => setCurrentPage('Videos')} className="hover:text-[#B28930] transition-colors">Videos</button></li>
                <li><button onClick={() => setCurrentPage('Blog')} className="hover:text-[#B28930] transition-colors">Blog</button></li>
                <li><button onClick={() => setCurrentPage('Audio')} className="hover:text-[#B28930] transition-colors">Audio</button></li>
                <li><a href="#" className="hover:text-[#B28930] transition-colors">Events</a></li>
                <li><a href="#" className="hover:text-[#B28930] transition-colors">Ministries</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Service Times</h4>
              <div className="text-gray-300 space-y-2">
                <p>Sunday Worship: 9:00 AM & 11:00 AM</p>
                <p>Wednesday Bible Study: 7:00 PM</p>
                <p>Youth Group: Friday 6:00 PM</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Grace Church. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      {/* Floating Contact Button */}
      <FloatingContact />
    </div>
  );
}