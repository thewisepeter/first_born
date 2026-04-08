// app/partner/signup/[token]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { SignupForm } from './SignupForm';
import { SuccessCard } from './SuccessCard';

export default function PartnerSignupPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [inviteData, setInviteData] = useState<{
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    expires_at: string;
  } | null>(null);

  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await fetch(`/api/partnership/validate-token?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Invalid token');
        }

        setInviteData(data.data);
      } catch (error: any) {
        setError(error.message || 'Failed to validate invitation');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      validateToken();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <p className="text-gray-600">Validating your invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Invitation Error</CardTitle>
            <CardDescription className="text-center">
              We couldn't validate your invitation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 mb-4">This could be because:</p>
              <ul className="text-sm text-gray-500 space-y-1 text-left">
                <li>• The invitation link has expired</li>
                <li>• The invitation has already been used</li>
                <li>• The link is invalid or malformed</li>
              </ul>
              <p className="mt-6 text-sm text-gray-500">
                Please contact support if you believe this is an error.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <SuccessCard />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Complete Your Partner Signup</CardTitle>
          <CardDescription className="text-center">
            Create your account to join the partnership
          </CardDescription>
        </CardHeader>
        <CardContent>
          {inviteData && (
            <SignupForm
              token={token}
              email={inviteData.email}
              defaultFirstName={inviteData.firstName}
              defaultLastName={inviteData.lastName}
              defaultPhone={inviteData.phone}
              onSuccess={() => setSuccess(true)}
            />
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              By completing this signup, you agree to our Terms of Service and Privacy Policy. Your
              invitation expires on{' '}
              {inviteData ? new Date(inviteData.expires_at).toLocaleDateString() : ''}.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
