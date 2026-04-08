// app/partner/signup/[token]/SignupForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { CheckCircle, Eye, EyeOff } from 'lucide-react';

interface SignupFormProps {
  token: string;
  email: string;
  defaultFirstName?: string;
  defaultLastName?: string;
  defaultPhone?: string;
  onSuccess: () => void;
}

export function SignupForm({
  token,
  email,
  defaultFirstName = '',
  defaultLastName = '',
  defaultPhone = '',
  onSuccess,
}: SignupFormProps) {
  const [formData, setFormData] = useState({
    firstName: defaultFirstName,
    lastName: defaultLastName,
    phone: defaultPhone,
    password: '',
    passwordConfirm: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (submitError) setSubmitError('');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.passwordConfirm) newErrors.passwordConfirm = 'Please confirm your password';

    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (
      formData.password &&
      formData.passwordConfirm &&
      formData.password !== formData.passwordConfirm
    ) {
      newErrors.passwordConfirm = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/partnership/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          password: formData.password,
          passwordConfirm: formData.passwordConfirm,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete signup');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Signup error:', error);
      setSubmitError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <div className="p-3 bg-gray-50 rounded-md">
          <p className="text-sm font-medium text-gray-700">Email</p>
          <p className="text-lg font-semibold text-gray-900">{email}</p>
          <p className="text-xs text-gray-500 mt-1">
            Your account will be created with this email address
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            placeholder="John"
            className={errors.firstName ? 'border-red-500' : ''}
            disabled={isSubmitting}
          />
          {errors.firstName && <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>}
        </div>

        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            placeholder="Smith"
            className={errors.lastName ? 'border-red-500' : ''}
            disabled={isSubmitting}
          />
          {errors.lastName && <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="+256 775 123 456"
          className={errors.phone ? 'border-red-500' : ''}
          disabled={isSubmitting}
        />
        {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
      </div>

      <div>
        <Label htmlFor="password">Password *</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="Create a secure password"
            className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
            disabled={isSubmitting}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
        <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters long</p>
      </div>

      <div>
        <Label htmlFor="passwordConfirm">Confirm Password *</Label>
        <div className="relative">
          <Input
            id="passwordConfirm"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.passwordConfirm}
            onChange={(e) => handleChange('passwordConfirm', e.target.value)}
            placeholder="Confirm your password"
            className={errors.passwordConfirm ? 'border-red-500 pr-10' : 'pr-10'}
            disabled={isSubmitting}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.passwordConfirm && (
          <p className="text-sm text-red-600 mt-1">{errors.passwordConfirm}</p>
        )}
      </div>

      {submitError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm font-medium">Error</p>
          <p className="text-red-500 text-xs mt-1">{submitError}</p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-600 to-[#B28930] text-white hover:from-purple-700 hover:to-[#A07828]"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          'Creating Account...'
        ) : (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Complete Signup
          </>
        )}
      </Button>
    </form>
  );
}
