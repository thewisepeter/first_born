// src/app/components/partnership/PartnerSignIn.tsx

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { LogIn, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface PartnerSignInProps {
  variant?: 'outline' | 'link' | 'default' | 'ghost' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function PartnerSignIn({
  variant = 'outline',
  size = 'default',
  className = '',
}: PartnerSignInProps) {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const { login, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors = { email: '', password: '' };
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';

    setErrors(newErrors);
    if (newErrors.email || newErrors.password) return;

    const result = await login(email, password);

    if (result.success) {
      setShowForm(false);
      setEmail('');
      setPassword('');
      setErrors({ email: '', password: '' });
      // Redirect to partnership dashboard
      router.push('/partnership');
    } else {
      alert(result.error || 'Login failed');
    }
  };

  const handleForgotPassword = () => {
    alert('Forgot password feature coming soon!');
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowForm(true)}
        className={`border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8 py-3 rounded-lg ${className}`}
      >
        <LogIn className="h-4 w-4 mr-2" />
        Partner Sign In
      </Button>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md w-[95%]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">Partner Sign In</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="partner@example.com"
                className={errors.email ? 'border-red-300' : ''}
                disabled={authLoading}
              />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>

            {/* Password with Forgot link */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Password *</label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-purple-600 hover:underline"
                  disabled={authLoading}
                >
                  Forgot password?
                </button>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={errors.password ? 'border-red-300' : ''}
                disabled={authLoading}
              />
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={authLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-[#B28930] text-white"
            >
              {authLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            {/* Help text */}
            <p className="text-xs text-gray-500 text-center">
              Need help? Contact partnership support
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
