'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Send, BookOpen } from 'lucide-react';
import { ActionButtons } from './ActionButtons';

interface TestimonyFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

/**
 * Read CSRF token directly from cookie
 * (Most reliable approach for mobile browsers)
 */
const getCsrfToken = (): string => {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : '';
};

export function ShareStorySection() {
  const [showTestimonyForm, setShowTestimonyForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<TestimonyFormData>>({});
  const [formData, setFormData] = useState<TestimonyFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleChange = (field: keyof TestimonyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const errors: Partial<TestimonyFormData> = {};

    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Enter a valid email';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }

    if (!formData.message.trim()) {
      errors.message = 'Testimony is required';
    } else if (formData.message.trim().length < 20) {
      errors.message = 'At least 20 characters required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const csrfToken = getCsrfToken();
    if (!csrfToken) {
      alert('Security error. Please refresh the page and try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contactmessages/testimony/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || 'Failed to submit testimony');
      }

      // Success
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: '',
      });
      setFormErrors({});
      setShowTestimonyForm(false);

      alert('Thank you for sharing your testimony!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 text-center bg-gradient-to-r from-purple-50 to-[#F5F0E1] p-8 rounded-2xl">
          <h3 className="text-2xl font-bold mb-4">Advance the Kingdom With Us?</h3>
          <p className="text-gray-600 mb-6">Your testimony and partnership help transform lives.</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => setShowTestimonyForm(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Share Your Testimony
            </Button>

            <ActionButtons />
          </div>
        </div>
      </section>

      {/* Modal */}
      <Dialog open={showTestimonyForm} onOpenChange={setShowTestimonyForm}>
        <DialogContent className="max-w-lg w-[95%]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-2xl">
              <BookOpen className="h-6 w-6 mr-2 text-purple-600" />
              Share Your Testimony
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                />
                {formErrors.firstName && (
                  <p className="text-xs text-red-600">{formErrors.firstName}</p>
                )}
              </div>

              <div>
                <Label>Last Name</Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                />
                {formErrors.lastName && (
                  <p className="text-xs text-red-600">{formErrors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
              {formErrors.email && <p className="text-xs text-red-600">{formErrors.email}</p>}
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
              {formErrors.phone && <p className="text-xs text-red-600">{formErrors.phone}</p>}
            </div>

            <div>
              <Label>Your Testimony</Label>
              <Textarea
                rows={4}
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
              />
              {formErrors.message && <p className="text-xs text-red-600">{formErrors.message}</p>}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTestimonyForm(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-purple-600 to-[#B28930] text-white"
              >
                {isSubmitting ? (
                  'Sharing…'
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Share Testimony
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
