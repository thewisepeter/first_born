'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface NavigationProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export function Navigation({ currentPage, setCurrentPage }: NavigationProps) {
  const navItems = ['Home', 'About', 'Videos'];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button 
              onClick={() => setCurrentPage('Home')}
              className="text-2xl font-bold text-purple-600 hover:text-purple-700 transition-colors"
            >
              Grace Church
            </button>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => setCurrentPage(item)}
                className={`px-3 py-2 rounded-md transition-colors ${
                  currentPage === item
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                }`}
              >
                {item}
              </button>
            ))}
            
            {/* Media Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center px-3 py-2 rounded-md text-gray-600 hover:text-purple-600 hover:bg-gray-50 transition-colors">
                  Media
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setCurrentPage('Blog')}>Blog</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrentPage('Audio')}>Audio</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="p-2 rounded-md text-gray-600 hover:text-purple-600 hover:bg-gray-50">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}