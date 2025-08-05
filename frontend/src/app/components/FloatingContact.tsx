'use client';

import { useState } from 'react';
import { MessageCircle, X, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from './ui/button';

export function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Contact Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 bg-white rounded-lg shadow-2xl border border-gray-200 p-6 w-80 z-40">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Contact Us</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">(555) 123-4567</p>
                <p className="text-sm text-gray-600">Call us</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">info@gracechurch.org</p>
                <p className="text-sm text-gray-600">Email us</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">123 Faith Street</p>
                <p className="text-sm text-gray-600">Visit us</p>
              </div>
            </div>
          </div>
          
          <Button 
            className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white"
          >
            Send Message
          </Button>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-[#B28930] hover:from-purple-700 hover:to-[#9A7328] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>
    </>
  );
}