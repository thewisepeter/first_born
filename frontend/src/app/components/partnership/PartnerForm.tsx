'use client';

import { ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Users, Send } from 'lucide-react';
import { Button } from '../ui/button'; // Move import to top

export interface PartnerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

interface PartnerFormProps {
  title: string;
  icon?: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: PartnerFormData;
  onFormDataChange: (field: keyof PartnerFormData, value: string) => void;
  errors: Partial<PartnerFormData>;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  submitButtonText?: string;
  children?: ReactNode;
  disabled?: boolean; // Add disabled prop
}

export function PartnerForm({
  title,
  icon = <Users className="h-6 w-6 mr-2 text-purple-600" />,
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  errors,
  isSubmitting,
  onSubmit,
  submitButtonText = 'Submit',
  children,
  disabled = false,
}: PartnerFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[95%] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl font-bold">
            {icon}
            {title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Personal Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                First Name *
              </Label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => onFormDataChange('firstName', e.target.value)}
                placeholder="John"
                className={`mt-1 ${errors.firstName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                disabled={isSubmitting || disabled}
              />
              {errors.firstName && <p className="text-xs text-red-600">{errors.firstName}</p>}
            </div>

            <div>
              <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                Last Name *
              </Label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => onFormDataChange('lastName', e.target.value)}
                placeholder="Smith"
                className={`mt-1 ${errors.lastName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                disabled={isSubmitting || disabled}
              />
              {errors.lastName && <p className="text-xs text-red-600">{errors.lastName}</p>}
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onFormDataChange('email', e.target.value)}
              placeholder="your.email@example.com"
              className={`mt-1 ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              disabled={isSubmitting || disabled}
            />
            {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Phone *
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => onFormDataChange('phone', e.target.value)}
              placeholder="+256 775 123 456"
              className={`mt-1 ${errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              disabled={isSubmitting || disabled}
            />
            {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
          </div>

          {/* Custom Fields (can be overridden by children) */}
          {children || (
            <div>
              <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                Commitment (Optional)
              </Label>
              <Textarea
                id="message"
                rows={4}
                value={formData.message}
                onChange={(e) => onFormDataChange('message', e.target.value)}
                placeholder="I am committing to Ugx 100,000 weekly"
                className={`mt-1 resize-none ${errors.message ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                disabled={isSubmitting || disabled}
              />
              {errors.message && <p className="text-xs text-red-600">{errors.message}</p>}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting || disabled}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || disabled}
              className="flex-1 bg-gradient-to-r from-purple-600 to-[#B28930] text-white hover:from-purple-700 hover:to-[#A07828]"
            >
              {isSubmitting ? (
                'Submitting…'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {submitButtonText}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Re-export Button for convenience
export { Button } from '../ui/button';
