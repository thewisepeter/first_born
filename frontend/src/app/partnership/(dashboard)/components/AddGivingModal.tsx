// src/app/partnership/(dashboard)/components/AddGivingModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { DollarSign, Calendar, CreditCard, Building, PlusCircle } from 'lucide-react';

// Export the interface so it can be imported elsewhere
export interface AddGivingFormData {
  amount: string;
  giving_type: string;
  date: string;
  payment_method: 'mobile-money' | 'bank-transfer' | 'debit-card' | 'cash' | 'cheque';
}

interface AddGivingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: AddGivingFormData) => Promise<void> | void;
  initialData?: AddGivingFormData | null; // For editing existing giving records
  isEditing?: boolean;
}

export function AddGivingModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isEditing = false,
}: AddGivingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<AddGivingFormData>>({});
  const [givingForm, setGivingForm] = useState<AddGivingFormData>({
    amount: '',
    giving_type: '',
    date: new Date().toISOString().split('T')[0], // Today's date
    payment_method: 'mobile-money',
  });

  // Initialize form with initialData when modal opens or initialData changes
  useEffect(() => {
    if (initialData) {
      setGivingForm(initialData);
    } else {
      // Reset to defaults if no initialData
      setGivingForm({
        amount: '',
        giving_type: '',
        date: new Date().toISOString().split('T')[0],
        payment_method: 'mobile-money',
      });
    }
  }, [initialData, isOpen]);

  // Get today's date for max attribute
  const today = new Date().toISOString().split('T')[0];

  const handleChange = (field: keyof AddGivingFormData, value: string) => {
    if (field === 'amount') {
      // Remove anything that is not a digit
      const numericValue = value.replace(/\D/g, '');

      setGivingForm((prev) => ({
        ...prev,
        amount: numericValue,
      }));

      if (formErrors.amount) {
        setFormErrors((prev) => ({ ...prev, amount: undefined }));
      }

      return;
    }

    setGivingForm((prev) => ({ ...prev, [field]: value }));

    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const errors: Partial<AddGivingFormData> = {};

    if (!givingForm.amount.trim()) {
      errors.amount = 'Amount is required';
    } else if (!/^\d+$/.test(givingForm.amount)) {
      errors.amount = 'Amount must be a number';
    } else if (parseInt(givingForm.amount) < 1000) {
      errors.amount = 'Minimum amount is UGX 1,000';
    }

    if (!givingForm.giving_type.trim()) {
      errors.giving_type = 'Giving type is required';
    }

    if (!givingForm.date.trim()) {
      errors.date = 'Date is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // If parent component provided onSubmit handler, use it
      if (onSubmit) {
        await onSubmit(givingForm);
      } else {
        // Default behavior - simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        alert(
          isEditing
            ? 'Giving record has been updated successfully!'
            : 'Giving record has been added successfully!'
        );
      }

      // Reset form and close modal
      setGivingForm({
        amount: '',
        giving_type: '',
        date: new Date().toISOString().split('T')[0],
        payment_method: 'mobile-money',
      });
      setFormErrors({});
      onClose();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : `Failed to ${isEditing ? 'update' : 'add'} giving record. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to format payment method label
  const getPaymentMethodLabel = (method: AddGivingFormData['payment_method']) => {
    switch (method) {
      case 'mobile-money':
        return 'Mobile Money';
      case 'bank-transfer':
        return 'Bank Transfer';
      case 'debit-card':
        return 'Debit Card';
      case 'cash':
        return 'Cash';
      case 'cheque':
        return 'Cheque';
      default:
        return method;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-[95%]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            {isEditing ? (
              <>
                <DollarSign className="h-6 w-6 mr-2 text-purple-600" />
                Edit Giving Record
              </>
            ) : (
              <>
                <PlusCircle className="h-6 w-6 mr-2 text-purple-600" />
                Record New Giving
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
              Amount (UGX)
            </Label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">UGX</span>
              </div>
              <Input
                id="amount"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={givingForm.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                onKeyDown={(e) => {
                  // Allow: backspace, delete, arrows, tab
                  if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                    return;
                  }

                  // Block non-numeric keys
                  if (!/^\d$/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                placeholder="100000"
                className={`pl-14 ${formErrors.amount ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                disabled={isSubmitting}
              />
            </div>
            {formErrors.amount && <p className="text-xs text-red-600">{formErrors.amount}</p>}
          </div>

          {/* Giving Type */}
          <div>
            <Label htmlFor="giving_type" className="text-sm font-medium text-gray-700">
              Giving Type
            </Label>
            <select
              id="giving_type"
              value={givingForm.giving_type}
              onChange={(e) => handleChange('giving_type', e.target.value)}
              className={`w-full mt-1 p-2 border rounded-lg text-sm ${
                formErrors.giving_type
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            >
              <option value="">Select giving type</option>
              <option value="prophetic-offering">Prophetic Offering</option>
              <option value="love-offering">Love Offering</option>
              <option value="weekly-partnership">Weekly Partnership</option>
              <option value="spirit-world">Spirit World Broadcast</option>
              <option value="saturday-fellowship">Saturday Fellowship</option>
              <option value="office-rent">Office Rent</option>
              <option value="drive">Drive Giving</option>
            </select>
            {formErrors.giving_type && (
              <p className="text-xs text-red-600">{formErrors.giving_type}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <Label htmlFor="date" className="text-sm font-medium text-gray-700">
              Giving Date
            </Label>
            <Input
              id="date"
              type="date"
              value={givingForm.date}
              onChange={(e) => handleChange('date', e.target.value)}
              max={today}
              className={`mt-1 ${formErrors.date ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              disabled={isSubmitting}
            />
            {formErrors.date && <p className="text-xs text-red-600">{formErrors.date}</p>}
          </div>

          {/* Payment Method */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Payment Method</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {[
                {
                  value: 'mobile-money',
                  label: 'Mobile Money',
                  icon: <DollarSign className="h-4 w-4" />,
                },
                {
                  value: 'bank-transfer',
                  label: 'Bank Transfer',
                  icon: <Building className="h-4 w-4" />,
                },
                { value: 'debit-card', label: 'Card', icon: <CreditCard className="h-4 w-4" /> },
                { value: 'cash', label: 'Cash', icon: <DollarSign className="h-4 w-4" /> },
                { value: 'cheque', label: 'Cheque', icon: <DollarSign className="h-4 w-4" /> },
              ].map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() =>
                    handleChange(
                      'payment_method',
                      method.value as AddGivingFormData['payment_method']
                    )
                  }
                  className={`p-3 rounded-lg border flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                    givingForm.payment_method === method.value
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {method.icon}
                  {method.label}
                </button>
              ))}
            </div>
            {formErrors.payment_method && (
              <p className="text-xs text-red-600">{formErrors.payment_method}</p>
            )}
          </div>

          {/* Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold">UGX {givingForm.amount || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-semibold capitalize">
                  {givingForm.giving_type.replace(/-/g, ' ') || 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold">
                  {givingForm.date ? new Date(givingForm.date).toLocaleDateString() : 'Select date'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-semibold">
                  {getPaymentMethodLabel(givingForm.payment_method)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-semibold text-green-600">Completed</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-600 to-[#B28930] text-white"
            >
              {isSubmitting ? (
                isEditing ? (
                  'Updating...'
                ) : (
                  'Recording...'
                )
              ) : (
                <>
                  {isEditing ? (
                    <DollarSign className="h-4 w-4 mr-2" />
                  ) : (
                    <PlusCircle className="h-4 w-4 mr-2" />
                  )}
                  {isEditing ? 'Update Record' : 'Record Giving'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
