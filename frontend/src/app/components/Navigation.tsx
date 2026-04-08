'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, X, Menu, ChevronRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileMediaExpanded, setIsMobileMediaExpanded] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Prophecies', href: '/prophecies' },
    { name: 'Testimonies', href: '/testimonies' },
    { name: 'Partnership', href: '/partnership' },
  ];

  const mediaItems = [
    { name: "Prophet's Blog", href: '/blog' },
    { name: 'Audio Sermons', href: '/audio' },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsMobileMediaExpanded(false);
  };

  const toggleMobileMedia = () => {
    setIsMobileMediaExpanded(!isMobileMediaExpanded);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsMobileMediaExpanded(false);
  };

  // Check if current page is active
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // Check if media dropdown should be active
  const isMediaActive = () => {
    return mediaItems.some((item) => isActive(item.href));
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-100 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link
                href="/"
                className="text-2xl font-bold text-purple-600 hover:text-purple-700 transition-colors"
              >
                <ImageWithFallback
                  src="/prophet_namara_logo.png"
                  alt="Prophet Namara Logo"
                  className="h-20 w-auto"
                />
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.slice(0, 4).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    isActive(item.href)
                      ? 'text-purple-600 bg-purple-50'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              {/* Desktop Media Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                      isMediaActive()
                        ? 'text-purple-600 bg-purple-50'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                    }`}
                  >
                    Media
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {mediaItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href}>{item.name}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Partnership (now after Media) */}
              {navItems.slice(4).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    isActive(item.href)
                      ? 'text-purple-600 bg-purple-50'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
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
          onClick={closeMobileMenu}
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
              onClick={closeMobileMenu}
              className="p-2 rounded-md text-gray-600 hover:text-purple-600 hover:bg-white/50 transition-colors"
              aria-label="Close mobile menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile Menu Content */}
          <div className="flex-1 overflow-y-auto py-6">
            <div className="space-y-2 px-6">
              {/* Home, About, Prophecies, Testimonies */}
              {navItems.slice(0, 4).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-purple-600 to-[#B28930] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-purple-600'
                  }`}
                >
                  <span className="font-medium">{item.name}</span>
                  {isActive(item.href) && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </Link>
              ))}

              {/* Media Section with Expandable Items */}
              <div className="border-t border-gray-100 pt-4 mt-4">
                <button
                  onClick={toggleMobileMedia}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between ${
                    isMediaActive()
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
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className={`w-full text-left px-4 py-2 rounded-md transition-colors text-sm ${
                        isActive(item.href)
                          ? 'bg-[#B28930] text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-purple-600'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Partnership (now after Media) */}
              {navItems.slice(4).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-purple-600 to-[#B28930] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-purple-600'
                  }`}
                >
                  <span className="font-medium">{item.name}</span>
                  {isActive(item.href) && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Menu Footer */}
          <div className="border-t border-gray-100 p-6 bg-gradient-to-r from-purple-50 to-[#F5F0E1]">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Connect with us</p>
              <div className="flex justify-center space-x-4">
                <a
                  href="https://x.com/ProphetNamara"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors"
                  aria-label="Twitter"
                >
                  <span className="text-white text-xs font-bold">X</span>
                </a>
                <a
                  href="https://www.youtube.com/channel/UCjF4Z56eCPD-gnWO1TOmFMQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-[#B28930] rounded-full flex items-center justify-center hover:bg-[#9a7729] transition-colors"
                  aria-label="YouTube"
                >
                  <span className="text-white text-xs font-bold">YT</span>
                </a>
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
