'use client';

import { useState } from 'react';
import { ChevronDown, X, Menu, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface NavigationProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export function Navigation({ currentPage, setCurrentPage }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileMediaExpanded, setIsMobileMediaExpanded] = useState(false);

  const navItems = [
    { name: 'Home', page: 'Home' },
    { name: 'About', page: 'About' },
    { name: 'Prophecies', page: 'Videos' }, // Display as "Prophecies" but reference as "Videos"
  ];

  const mediaItems = [
    { name: "Prophet's Blog", page: 'Blog' },
    { name: 'Spirit World', page: 'Audio' },
  ];

  const handleMobileNavClick = (page: string) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
    setIsMobileMediaExpanded(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsMobileMediaExpanded(false);
  };

  const toggleMobileMedia = () => {
    setIsMobileMediaExpanded(!isMobileMediaExpanded);
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-100 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex-shrink-0">
              <button
                onClick={() => handleMobileNavClick('Home')}
                className="text-2xl font-bold text-purple-600 hover:text-purple-700 transition-colors"
              >
                <ImageWithFallback
                  src="/prophet_namara_logo.png"
                  alt="Prophet Namara Logo"
                  className="h-20 w-auto"
                />
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => setCurrentPage(item.page)}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    currentPage === item.page
                      ? 'text-purple-600 bg-purple-50'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </button>
              ))}

              {/* Desktop Media Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                      ['Blog', 'Audio'].includes(currentPage)
                        ? 'text-purple-600 bg-purple-50'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                    }`}
                  >
                    Media
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setCurrentPage('Blog')}>
                    Prophet's Blog
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCurrentPage('Audio')}>
                    Spirit World
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-gray-600 hover:text-purple-600 hover:bg-gray-50 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Slide Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-[#F5F0E1]">
            <h3 className="text-lg font-bold text-gray-900">Menu</h3>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-md text-gray-600 hover:text-purple-600 hover:bg-white/50 transition-colors"
              aria-label="Close mobile menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile Menu Content */}
          <div className="flex-1 overflow-y-auto py-6">
            <div className="space-y-2 px-6">
              {/* Regular Navigation Items */}
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => handleMobileNavClick(item.page)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between ${
                    currentPage === item.page
                      ? 'bg-gradient-to-r from-purple-600 to-[#B28930] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-purple-600'
                  }`}
                >
                  <span className="font-medium">{item.name}</span>
                  {currentPage === item.page && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </button>
              ))}

              {/* Media Section with Expandable Items */}
              <div className="border-t border-gray-100 pt-4 mt-4">
                <button
                  onClick={toggleMobileMedia}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between ${
                    ['Blog', 'Audio'].includes(currentPage)
                      ? 'bg-gradient-to-r from-purple-600 to-[#B28930] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-purple-600'
                  }`}
                >
                  <span className="font-medium">Media</span>
                  <ChevronRight
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isMobileMediaExpanded ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {/* Media Submenu */}
                <div
                  className={`mt-2 ml-4 space-y-1 overflow-hidden transition-all duration-300 ${
                    isMobileMediaExpanded ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  {mediaItems.map((item) => (
                    <button
                      key={item.page}
                      onClick={() => handleMobileNavClick(item.page)}
                      className={`w-full text-left px-4 py-2 rounded-md transition-colors text-sm ${
                        currentPage === item.page
                          ? 'bg-[#B28930] text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-purple-600'
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Footer */}
          <div className="border-t border-gray-100 p-6 bg-gradient-to-r from-purple-50 to-[#F5F0E1]">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Connect with us</p>
              <div className="flex justify-center space-x-4">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">G</span>
                </div>
                <div className="w-8 h-8 bg-[#B28930] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">C</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prevent body scroll when mobile menu is open */}
      {isMobileMenuOpen && (
        <style jsx global>{`
          body {
            overflow: hidden;
          }
        `}</style>
      )}
    </>
  );
}
