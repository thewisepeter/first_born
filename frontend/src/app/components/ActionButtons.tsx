'use client';

import { PartnerRequest } from './partnership/PartnerRequest';
import { PartnerSignIn } from './partnership/PartnerSignIn';
import { Button } from './ui/button';

export function ActionButtons() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      {/* Give Button */}
      <a
        href="https://flutterwave.com/pay/prophetnamaraernesti69d"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button
          variant="outline"
          className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8 py-3 rounded-lg"
        >
          Give
        </Button>
      </a>

      {/* Partner Sign Up */}
      <PartnerRequest />

      {/* Partner Sign In */}
    </div>
  );
}

// Alternative: Show different buttons based on auth state
export function AuthActionButtons({ isAuthenticated = false }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <a
        href="https://flutterwave.com/pay/prophetnamaraernesti69d"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button
          variant="outline"
          className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8 py-3 rounded-lg"
        >
          Give
        </Button>
      </a>

      {isAuthenticated ? (
        <a href="/partnership">
          <Button
            variant="outline"
            className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8 py-3 rounded-lg"
          >
            Go to Dashboard
          </Button>
        </a>
      ) : (
        <>
          <PartnerRequest />
          <PartnerSignIn />
        </>
      )}
    </div>
  );
}
