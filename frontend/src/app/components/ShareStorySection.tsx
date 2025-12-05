'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { X, Send, BookOpen, Phone } from 'lucide-react';

interface TestimonyFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

// CSRF token helper function - READ FROM COOKIE
const getCsrfToken = (): string => {
  if (typeof document === 'undefined') return ''; // Server-side check

  const cookieString = document.cookie;
  const cookies = cookieString.split('; ');

  for (const cookie of cookies) {
    if (cookie.startsWith('csrftoken=')) {
      return cookie.substring('csrftoken='.length);
    }
  }

  return '';
};

export function ShareStorySection() {
  const [showTestimonyForm, setShowTestimonyForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [testimonyFormData, setTestimonyFormData] = useState<TestimonyFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<TestimonyFormData>>({});

  // Get CSRF token when modal opens
  useEffect(() => {
    if (showTestimonyForm) {
      const token = getCsrfToken();
      setCsrfToken(token);

      // For debugging
      console.log('Testimony Form - CSRF Token found:', token ? 'Yes' : 'No');
      if (token) {
        console.log('Testimony Form - Token length:', token.length);
      }
    }
  }, [showTestimonyForm]);

  const handleInputChange = (field: keyof TestimonyFormData, value: string) => {
    setTestimonyFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Partial<TestimonyFormData> = {};

    if (!testimonyFormData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!testimonyFormData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!testimonyFormData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testimonyFormData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!testimonyFormData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[\d\s\-\+\(\)]+$/.test(testimonyFormData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (!testimonyFormData.message.trim()) {
      errors.message = 'Testimony is required';
    } else if (testimonyFormData.message.trim().length < 20) {
      errors.message = 'Testimony must be at least 20 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Get CSRF token - try from state first, then from cookies directly
      let token = csrfToken || getCsrfToken();

      if (!token) {
        throw new Error('CSRF token not found. Please refresh the page and try again.');
      }

      // Use relative URL instead of absolute
      const response = await fetch('/api/contactmessages/testimony/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': token, // Add CSRF token header
        },
        credentials: 'include', // Important: include cookies
        body: JSON.stringify(testimonyFormData),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        console.error('Testimony API error details:', {
          status: response.status,
          statusText: response.statusText,
          data: data,
        });

        // Handle CSRF token errors specifically
        if (response.status === 403 && data?.detail?.includes('CSRF')) {
          // CSRF token might be expired
          const freshToken = getCsrfToken();
          if (freshToken && freshToken !== token) {
            console.log('Testimony Form - Retrying with fresh CSRF token');
            setCsrfToken(freshToken);
          }
          throw new Error('Session expired. Please refresh the page and try again.');
        }

        // Handle validation errors from Django
        if (response.status === 400 && data) {
          const errorMessages = Object.entries(data)
            .map(
              ([field, messages]) =>
                `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
            )
            .join('\n');
          throw new Error(`Validation error:\n${errorMessages}`);
        }

        throw new Error(data?.detail || data?.message || 'Failed to submit testimony');
      }

      // Success — clear form and close modal
      setTestimonyFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: '',
      });
      setFormErrors({});
      setShowTestimonyForm(false);

      // Show success message
      alert('Thank you for sharing your testimony! We will review it and may contact you.');
    } catch (error) {
      console.error('Testimony form submission error:', error);
      alert(
        `Error: ${error instanceof Error ? error.message : 'Something went wrong. Please try again.'}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowTestimonyForm(false);
    setFormErrors({});
    setTestimonyFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' });
  };

  // For debugging: Check what cookies are available
  const checkCookies = () => {
    console.log('All cookies:', document.cookie);
    console.log('CSRF token:', getCsrfToken());
  };

  return (
    <>
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center p-8 bg-gradient-to-r from-purple-50 to-[#F5F0E1] rounded-2xl max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Share Your Testimony?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              We would love to hear how God is working in your life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => {
                  // Optional: check cookies before showing form
                  if (process.env.NODE_ENV === 'development') {
                    checkCookies();
                  }
                  setShowTestimonyForm(true);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Share Your Testimony
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Share Testimony Modal */}
      <Dialog open={showTestimonyForm} onOpenChange={setShowTestimonyForm}>
        <DialogContent className="max-w-lg w-[95%] !grid !grid-cols-1">
          <div className="w-full max-w-full overflow-hidden">
            {' '}
            {/* Added overflow-hidden */}
            <DialogHeader className="space-y-4 w-full">
              <div className="flex items-center justify-between w-full">
                <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
                  <BookOpen className="h-6 w-6 mr-2 text-purple-600" />
                  Share Your Testimony
                </DialogTitle>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-[#F5F0E1] p-4 rounded-lg w-full">
                <p className="text-gray-700 text-sm leading-relaxed">
                  Your story of faith, transformation, and God's goodness has the power to inspire
                  others. Share how God has worked in your life!
                </p>
              </div>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-full">
              {/* Hidden CSRF token field for fallback */}
              {csrfToken && <input type="hidden" name="csrfmiddlewaretoken" value={csrfToken} />}

              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="w-full">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={testimonyFormData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="John"
                    className={`mt-1 w-full min-w-0 ${formErrors.firstName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    disabled={isSubmitting}
                  />
                  {formErrors.firstName && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.firstName}</p>
                  )}
                </div>

                <div className="w-full">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={testimonyFormData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Smith"
                    className={`mt-1 w-full min-w-0 ${formErrors.lastName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    disabled={isSubmitting}
                  />
                  {formErrors.lastName && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="w-full">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={testimonyFormData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="john.smith@example.com"
                  className={`mt-1 w-full min-w-0 ${formErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  disabled={isSubmitting}
                />
                {formErrors.email && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>
                )}
              </div>

              <div className="w-full">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={testimonyFormData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                  className={`mt-1 w-full min-w-0 ${formErrors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  disabled={isSubmitting}
                />
                {formErrors.phone && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.phone}</p>
                )}
              </div>

              <div className="w-full">
                <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                  Your Testimony *
                </Label>
                <div className="mt-1 w-full">
                  <Textarea
                    id="message"
                    value={testimonyFormData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Share your story of how the power of prophecy has influenced your life for the better"
                    rows={4}
                    className={`
              w-full min-w-0 max-w-full
              resize-none
              ${formErrors.message ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            `}
                    disabled={isSubmitting}
                    style={{
                      boxSizing: 'border-box',
                      wordWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                      maxWidth: '100%',
                    }}
                  />
                </div>
                {formErrors.message && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.message}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4 w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="flex-1 min-w-0"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !csrfToken}
                  className="flex-1 min-w-0 bg-gradient-to-r from-purple-600 to-[#B28930] hover:from-purple-700 hover:to-[#9A7328] text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Sharing...
                    </>
                  ) : !csrfToken ? (
                    'CSRF Token Missing'
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Share Testimony
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center pt-2 w-full">
                Your testimony will be reviewed and we will contact you
              </p>

              {/* Debug info - remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-400 border-t pt-2 w-full">
                  CSRF token status:{' '}
                  {csrfToken ? `✓ Found (${csrfToken.substring(0, 10)}...)` : '✗ Missing'}
                </div>
              )}
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
