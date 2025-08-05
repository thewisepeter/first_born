'use client';

import { Button } from './ui/button';

export function ActionButtons() {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-[#F5F0E1] py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            className="bg-[#B28930] hover:bg-[#9A7328] text-white px-8 py-3 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
          >
            Give
          </Button>
          <Button 
            variant="outline"
            className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8 py-3 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
          >
            Become a Partner
          </Button>
        </div>
      </div>
    </div>
  );
}