'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { X, Send, Users, Heart } from 'lucide-react';

interface PartnerFormData {
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

export function ActionButtons() {
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [partnerFormData, setPartnerFormData] = useState<PartnerFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<PartnerFormData>>({});

  // Get CSRF token when modal opens
  useEffect(() => {
    if (showPartnerForm) {
      const token = getCsrfToken();
      setCsrfToken(token);

      // For debugging
      console.log('Partner Form - CSRF Token found:', token ? 'Yes' : 'No');
      if (token) {
        console.log('Partner Form - Token length:', token.length);
      }
    }
  }, [showPartnerForm]);

  const handleInputChange = (field: keyof PartnerFormData, value: string) => {
    setPartnerFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Partial<PartnerFormData> = {};

    if (!partnerFormData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!partnerFormData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!partnerFormData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(partnerFormData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!partnerFormData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[\d\s\-\+\(\)]+$/.test(partnerFormData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (!partnerFormData.message.trim()) {
      errors.message = 'Message is required';
    } else if (partnerFormData.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters';
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
      const response = await fetch('/api/partners/partner/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': token, // Add CSRF token header
        },
        credentials: 'include', // Important: include cookies
        body: JSON.stringify({
          firstName: partnerFormData.firstName,
          lastName: partnerFormData.lastName,
          email: partnerFormData.email,
          phone: partnerFormData.phone,
          message: partnerFormData.message,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        console.error('Partner API error details:', {
          status: response.status,
          statusText: response.statusText,
          data: data,
        });

        // Handle CSRF token errors specifically
        if (response.status === 403 && data?.detail?.includes('CSRF')) {
          // CSRF token might be expired
          const freshToken = getCsrfToken();
          if (freshToken && freshToken !== token) {
            console.log('Partner Form - Retrying with fresh CSRF token');
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

        throw new Error(data?.detail || data?.message || `HTTP error! status: ${response.status}`);
      }

      console.log('Partner form submitted successfully:', data);

      // Reset form and close modal
      setPartnerFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' });
      setFormErrors({});
      setShowPartnerForm(false);

      // Show success message
      alert('Thank you for your partnership interest! We will contact you within 24 hours.');
    } catch (error) {
      console.error('Partner form submission error:', error);
      alert(
        `Error: ${error instanceof Error ? error.message : 'Something went wrong. Please try again.'}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowPartnerForm(false);
    setFormErrors({});
    setPartnerFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' });
  };

  return (
    <>
      <div className="bg-gradient-to-r from-purple-50 to-[#F5F0E1] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://flutterwave.com/pay/prophetnamaraernesti69d"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-[#B28930] hover:bg-[#9A7328] text-white px-8 py-3 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg">
                Give
              </Button>
            </a>

            <Button
              variant="outline"
              onClick={() => {
                setShowPartnerForm(true);
              }}
              className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8 py-3 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
            >
              <Users className="h-4 w-4 mr-2" />
              Become a Partner
            </Button>
          </div>
        </div>
      </div>

      {/* Become a Partner Modal */}
      <Dialog open={showPartnerForm} onOpenChange={setShowPartnerForm}>
        <DialogContent className="max-w-lg w-[95%] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
                <Users className="h-6 w-6 mr-2 text-purple-600" />
                Become a Partner
              </DialogTitle>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-[#F5F0E1] p-4 rounded-lg">
              <p className="text-gray-700 text-sm leading-relaxed">
                Come into Partnership with Prophet Namara Ernest and become a partaker of the unique
                workings of God manifested in His life and the ministry.
              </p>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Hidden CSRF token field for fallback */}
            {csrfToken && <input type="hidden" name="csrfmiddlewaretoken" value={csrfToken} />}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  value={partnerFormData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="John"
                  className={`mt-1 ${formErrors.firstName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  disabled={isSubmitting}
                />
                {formErrors.firstName && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.firstName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  value={partnerFormData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Smith"
                  className={`mt-1 ${formErrors.lastName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  disabled={isSubmitting}
                />
                {formErrors.lastName && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={partnerFormData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="john.smith@example.com"
                className={`mt-1 ${formErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                disabled={isSubmitting}
              />
              {formErrors.email && <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>}
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Phone Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={partnerFormData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
                className={`mt-1 ${formErrors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                disabled={isSubmitting}
              />
              {formErrors.phone && <p className="mt-1 text-xs text-red-600">{formErrors.phone}</p>}
            </div>

            <div>
              <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                Share your financial commitment *
              </Label>
              <Textarea
                id="message"
                value={partnerFormData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="I am committing to UGX 100,000 weekly"
                rows={4}
                className={`mt-1 resize-none ${formErrors.message ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                disabled={isSubmitting}
              />
              {formErrors.message && (
                <p className="mt-1 text-xs text-red-600">{formErrors.message}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !csrfToken}
                className="flex-1 bg-gradient-to-r from-purple-600 to-[#B28930] hover:from-purple-700 hover:to-[#9A7328] text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : !csrfToken ? (
                  'CSRF Token Missing'
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center pt-2">
              Someone from our team will reach out to you within 24 hours
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
