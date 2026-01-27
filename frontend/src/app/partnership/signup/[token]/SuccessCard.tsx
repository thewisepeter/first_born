// app/partner/signup/[token]/SuccessCard.tsx
'use client';

import { Button } from '../../../components/ui/button';
import { CheckCircle, LogIn } from 'lucide-react';
import Link from 'next/link';

export function SuccessCard() {
  return (
    <div className="text-center space-y-6">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-gray-900">Welcome to the Partnership! 🎉</h3>
        <p className="text-gray-600">Your partner account has been successfully created.</p>
      </div>

      <div className="space-y-3 text-sm text-gray-500">
        <p>
          You can now access the partner dashboard with the email and password you just created.
        </p>
        <p>
          Someone from our team will reach out to you within 24 hours to welcome you officially.
        </p>
      </div>

      <div className="pt-4 space-y-3">
        <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
          <Link href="/partnership/login">
            <LogIn className="h-4 w-4 mr-2" />
            Sign in to Partner Dashboard
          </Link>
        </Button>

        <Button asChild variant="outline" className="w-full">
          <Link href="/">Return to Homepage</Link>
        </Button>
      </div>
    </div>
  );
}
