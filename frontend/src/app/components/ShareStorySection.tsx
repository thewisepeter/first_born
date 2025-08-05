'use client';

import { Button } from './ui/button';

export function ShareStorySection() {
  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center p-8 bg-gradient-to-r from-purple-50 to-[#F5F0E1] rounded-2xl max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Share Your Story?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            We would love to hear how God has been working in your life. Your testimony could be 
            the encouragement someone else needs to take their next step of faith.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8"
            >
              Share Your Testimony
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="border-[#B28930] text-[#B28930] hover:bg-[#B28930] hover:text-white px-8"
            >
              Contact Pastor
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}