'use client';

import { useState } from 'react';
import { PartnerForm, PartnerFormData } from './PartnerForm';
import { Users } from 'lucide-react';
import { Button } from './PartnerForm';

interface PartnerRequestProps {
  variant?: 'outline' | 'link' | 'default' | 'ghost' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function PartnerRequest({
  variant = 'default',
  size = 'default',
  className = '',
}: PartnerRequestProps) {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState<PartnerFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '', // Note: Check if backend accepts this
  });

  const [formErrors, setFormErrors] = useState<Partial<PartnerFormData>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = () => {
    const errors: Partial<PartnerFormData> = {};
    let isValid = true;

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
      isValid = false;
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
      isValid = false;
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
      isValid = false;
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
      isValid = false;
    }
    // Remove message validation if backend doesn't need it
    // if (!formData.message.trim()) {
    //   errors.message = 'Please tell us why you want to partner';
    //   isValid = false;
    // }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Call Next.js API route instead of Django directly
      const res = await fetch('/api/partnership/request/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          // message: formData.message, // Remove this - Django doesn't need it
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      setSubmitted(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: '', // Keep for form but don't send
      });
    } catch (err: any) {
      console.error('Submission error:', err);
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowForm(false);
    // Reset everything when closing
    if (submitted) {
      setSubmitted(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: '',
      });
    }
    setFormErrors({});
    setSubmitError(null);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowForm(true)}
        className={`bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg ${className}`}
      >
        <Users className="h-4 w-4 mr-2" />
        Become a Partner
      </Button>

      <PartnerForm
        title={submitted ? 'Request Received' : 'Partner With Us'}
        icon={<Users className="h-6 w-6 mr-2 text-purple-600" />}
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) handleClose();
        }}
        formData={formData}
        onFormDataChange={(field, value) => {
          setFormData((prev) => ({ ...prev, [field]: value }));
          // Clear error for this field when user starts typing
          if (formErrors[field as keyof PartnerFormData]) {
            setFormErrors((prev) => ({ ...prev, [field]: '' }));
          }
        }}
        errors={formErrors}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        submitButtonText={isSubmitting ? 'Submitting...' : 'Submit Request'}
        disabled={isSubmitting || submitted}
      >
        {submitted ? (
          <div className="text-center py-6 space-y-3">
            <p className="text-lg font-semibold text-gray-900">Thank you for your interest 🙏</p>
            <p className="text-sm text-gray-600">
              Your request has been received. Once reviewed, you'll receive an email with
              instructions to complete your partnership registration.
            </p>
            <Button onClick={handleClose} className="mt-4 bg-purple-600 hover:bg-purple-700">
              Close
            </Button>
          </div>
        ) : (
          <div className="text-xs text-gray-500 pt-2 space-y-2">
            <p>
              This is a partnership request. After review and approval, you'll receive a private
              invitation to complete registration.
            </p>
            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm font-medium">Submission Error</p>
                <p className="text-red-500 text-xs mt-1">{submitError}</p>
              </div>
            )}
          </div>
        )}
      </PartnerForm>
    </>
  );
}
