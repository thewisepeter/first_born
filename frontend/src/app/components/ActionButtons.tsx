'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Send, Users } from 'lucide-react';
import { getCsrfToken } from '@/app/lib/csrf';

interface PartnerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

export function ActionButtons() {
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [partnerFormData, setPartnerFormData] = useState<PartnerFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<PartnerFormData>>({});

  const handleInputChange = (field: keyof PartnerFormData, value: string) => {
    setPartnerFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Partial<PartnerFormData> = {};

    if (!partnerFormData.firstName.trim()) errors.firstName = 'First name is required';
    if (!partnerFormData.lastName.trim()) errors.lastName = 'Last name is required';

    if (!partnerFormData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(partnerFormData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!partnerFormData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }

    if (!partnerFormData.message.trim()) {
      errors.message = 'Message is required';
    } else if (partnerFormData.message.length < 10) {
      errors.message = 'Message must be at least 10 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const csrfToken = getCsrfToken();
      if (!csrfToken) {
        throw new Error('Security token missing. Please refresh the page.');
      }

      const response = await fetch('/api/partners/partner/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify(partnerFormData),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || 'Failed to submit form');
      }

      // Success
      setPartnerFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: '',
      });
      setFormErrors({});
      setShowPartnerForm(false);

      alert('Thank you for your partnership interest! We will contact you shortly.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowPartnerForm(false);
    setFormErrors({});
    setPartnerFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      message: '',
    });
  };

  return (
    <>
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

        <Button
          variant="outline"
          onClick={() => setShowPartnerForm(true)}
          className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8 py-3 rounded-lg"
        >
          <Users className="h-4 w-4 mr-2" />
          Become a Partner
        </Button>
      </div>

      <Dialog open={showPartnerForm} onOpenChange={setShowPartnerForm}>
        <DialogContent className="max-w-lg w-[95%] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-2xl font-bold">
              <Users className="h-6 w-6 mr-2 text-purple-600" />
              Become a Partner
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input
                  value={partnerFormData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                />
                {formErrors.firstName && (
                  <p className="text-xs text-red-600">{formErrors.firstName}</p>
                )}
              </div>

              <div>
                <Label>Last Name *</Label>
                <Input
                  value={partnerFormData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                />
                {formErrors.lastName && (
                  <p className="text-xs text-red-600">{formErrors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={partnerFormData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
              {formErrors.email && <p className="text-xs text-red-600">{formErrors.email}</p>}
            </div>

            <div>
              <Label>Phone *</Label>
              <Input
                value={partnerFormData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
              {formErrors.phone && <p className="text-xs text-red-600">{formErrors.phone}</p>}
            </div>

            <div>
              <Label>Commitment *</Label>
              <Textarea
                rows={4}
                value={partnerFormData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
              />
              {formErrors.message && <p className="text-xs text-red-600">{formErrors.message}</p>}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-purple-600 to-[#B28930] text-white"
              >
                {isSubmitting ? (
                  'Submitting…'
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
