'use client';

import { useState } from 'react';
import { MessageCircle, X, Phone, Mail, MapPin, Send, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  message: string;
}

export function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    message: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Partial<FormData> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
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
      const response = await fetch('http://127.0.0.1:8000/api/contactmessages/contact/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('API error:', errorData || response.statusText);
        throw new Error('Failed to submit contact message');
      }

      // Reset form on success
      setFormData({ fullName: '', email: '', phone: '', message: '' });
      setShowForm(false);
      setIsOpen(false);
      setFormErrors({});

      console.log('Form submitted successfully');
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowForm(false);
    setFormData({ fullName: '', email: '', phone: '', message: '' });
    setFormErrors({});
  };

  const handleBackToContact = () => {
    setShowForm(false);
    setFormErrors({});
  };

  return (
    <>
      {/* Contact Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 bg-white rounded-lg shadow-2xl border border-gray-200 w-80 z-40 overflow-hidden">
          {!showForm ? (
            // Contact Information View
            <div className="p-6">
              <div className="flex justify-center items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Contact Us</h3>
                <button
                  onClick={handleClose}
                  className="absolute right-6 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-4">
                  {/* WhatsApp QR Code with Phone */}
                  <div className="p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col items-center pt-3">
                      <img
                        src={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/prophet_namara_whatsapp_qr_purple.png`}
                        alt="WhatsApp QR Code"
                        className="w-36 h-36 object-contain rounded-lg border-2 border-purple-100 mb-2"
                      />
                      <p className="text-xs text-gray-600 mt-1">Scan QR for WhatsApp</p>

                      <div className="mt-4">
                        {' '}
                        {/* Added margin top here */}
                        <div className="flex items-center space-x-3 mb-3">
                          <Phone className="h-5 w-5 text-purple-600 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-gray-900">+256 778 030 496</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setShowForm(true)}
                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-[#B28930] hover:from-purple-700 hover:to-[#9A7328] text-white transition-all duration-200"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </div>
          ) : (
            // Contact Form View
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleBackToContact}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <h3 className="text-lg font-semibold text-gray-900">Send Message</h3>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Your full name"
                    className={`mt-1 ${formErrors.fullName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    disabled={isSubmitting}
                  />
                  {formErrors.fullName && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                    className={`mt-1 ${formErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    disabled={isSubmitting}
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    className={`mt-1 ${formErrors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    disabled={isSubmitting}
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.phone}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                    Message *
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="How can we help you today?"
                    rows={4}
                    className={`mt-1 resize-none ${formErrors.message ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    disabled={isSubmitting}
                  />
                  {formErrors.message && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-[#B28930] hover:from-purple-700 hover:to-[#9A7328] text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  We'll get back to you within 24 hours
                </p>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-[#B28930] hover:from-purple-700 hover:to-[#9A7328] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50 group"
      >
        {isOpen ? (
          <X className="h-6 w-6 transition-transform duration-200 group-hover:rotate-90" />
        ) : (
          <MessageCircle className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
        )}
      </button>
    </>
  );
}
