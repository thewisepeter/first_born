'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Calendar, DollarSign, Building, CreditCard, Pencil } from 'lucide-react';

// Export the interface so it can be imported elsewhere
export interface ScheduleFormData {
  id?: string | number; // Optional: For editing existing items
  amount: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'one-time'; // Added 'one-time'
  startDate: string;
  paymentMethod: 'mobile-money' | 'bank-transfer' | 'credit-card';
  purpose: string;
  notes: string;
  title?: string; // Optional: For display purposes
}

interface ScheduleGivingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: ScheduleFormData) => Promise<void> | void;
  initialData?: ScheduleFormData | null; // New: For editing
  isEditing?: boolean; // New: To distinguish between add/edit mode
}

export function ScheduleGivingModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isEditing = false,
}: ScheduleGivingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<ScheduleFormData>>({});
  const [scheduleForm, setScheduleForm] = useState<ScheduleFormData>({
    amount: '',
    frequency: 'weekly',
    startDate: getNextMonday(),
    paymentMethod: 'mobile-money',
    purpose: '',
    notes: '',
  });

  // Initialize form with initialData when modal opens or initialData changes
  useEffect(() => {
    if (initialData) {
      setScheduleForm(initialData);
    } else {
      // Reset to defaults if no initialData
      setScheduleForm({
        amount: '',
        frequency: 'weekly',
        startDate: getNextMonday(),
        paymentMethod: 'mobile-money',
        purpose: '',
        notes: '',
      });
    }
  }, [initialData, isOpen]);

  // Helper function to get next Monday
  function getNextMonday(): string {
    const today = new Date();
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7 || 7));
    return nextMonday.toISOString().split('T')[0];
  }

  const handleChange = (field: keyof ScheduleFormData, value: string) => {
    setScheduleForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const errors: Partial<ScheduleFormData> = {};

    if (!scheduleForm.amount.trim()) {
      errors.amount = 'Amount is required';
    } else if (!/^\d+$/.test(scheduleForm.amount)) {
      errors.amount = 'Amount must be a number';
    } else if (parseInt(scheduleForm.amount) < 1000) {
      errors.amount = 'Minimum amount is UGX 1,000';
    }

    if (!scheduleForm.startDate.trim()) {
      errors.startDate = 'Start date is required';
    }

    if (!scheduleForm.purpose.trim()) {
      errors.purpose = 'Purpose is required';
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
        await onSubmit(scheduleForm);
      } else {
        // Default behavior - simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        alert(
          isEditing
            ? 'Scheduled giving has been updated successfully!'
            : 'Scheduled giving has been set up successfully!'
        );
      }

      // Reset form and close modal
      setScheduleForm({
        amount: '',
        frequency: 'weekly',
        startDate: getNextMonday(),
        paymentMethod: 'mobile-money',
        purpose: '',
        notes: '',
      });
      setFormErrors({});
      onClose();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : `Failed to ${isEditing ? 'update' : 'schedule'} giving. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to format frequency label
  const getFrequencyLabel = (freq: ScheduleFormData['frequency']) => {
    switch (freq) {
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      case 'quarterly':
        return 'Quarterly';
      case 'one-time':
        return 'One Time';
      default:
        return freq;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-[95%]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            {isEditing ? (
              <>
                <Pencil className="h-6 w-6 mr-2 text-purple-600" />
                Edit Scheduled Giving
              </>
            ) : (
              <>
                <Calendar className="h-6 w-6 mr-2 text-purple-600" />
                Schedule New Giving
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
                value={scheduleForm.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                placeholder="100000"
                className={`pl-14 ${formErrors.amount ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                disabled={isSubmitting}
              />
            </div>
            {formErrors.amount && <p className="text-xs text-red-600">{formErrors.amount}</p>}
          </div>

          {/* Frequency */}
          <div>
            <Label htmlFor="frequency" className="text-sm font-medium text-gray-700">
              Frequency
            </Label>
            <div className="grid grid-cols-4 gap-2 mt-1">
              {['weekly', 'monthly', 'quarterly', 'one-time'].map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => handleChange('frequency', freq as ScheduleFormData['frequency'])}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    scheduleForm.frequency === freq
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {getFrequencyLabel(freq as ScheduleFormData['frequency'])}
                </button>
              ))}
            </div>
          </div>

          {/* Start Date / Next Payment */}
          <div>
            <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">
              {scheduleForm.frequency === 'one-time' ? 'Payment Date' : 'Start Date'}
            </Label>
            <Input
              id="startDate"
              type="date"
              value={scheduleForm.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={`mt-1 ${formErrors.startDate ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              disabled={isSubmitting}
            />
            {formErrors.startDate && <p className="text-xs text-red-600">{formErrors.startDate}</p>}
          </div>

          {/* Payment Method */}
          <div>
            <Label htmlFor="paymentMethod" className="text-sm font-medium text-gray-700">
              Payment Method
            </Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
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
                { value: 'credit-card', label: 'Card', icon: <CreditCard className="h-4 w-4" /> },
              ].map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() =>
                    handleChange('paymentMethod', method.value as ScheduleFormData['paymentMethod'])
                  }
                  className={`p-3 rounded-lg border flex flex-col items-center gap-1 text-sm font-medium transition-colors ${
                    scheduleForm.paymentMethod === method.value
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {method.icon}
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          {/* Purpose */}
          <div>
            <Label htmlFor="purpose" className="text-sm font-medium text-gray-700">
              Purpose
            </Label>
            <select
              id="purpose"
              value={scheduleForm.purpose}
              onChange={(e) => handleChange('purpose', e.target.value)}
              className={`w-full mt-1 p-2 border rounded-lg text-sm ${
                formErrors.purpose
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            >
              <option value="">Select purpose</option>
              <option value="weekly-partnership">Weekly Partnership</option>
              <option value="radio-broadcast">Radio Broadcast Support</option>
              <option value="youth-camp">Youth Camp Support</option>
              <option value="bible-distribution">Bible Distribution</option>
              <option value="fellowship">Fellowship Support</option>
              <option value="general">General Ministry Support</option>
            </select>
            {formErrors.purpose && <p className="text-xs text-red-600">{formErrors.purpose}</p>}
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              rows={2}
              value={scheduleForm.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Any special instructions or prayer requests..."
              className="mt-1 resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Summary */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2">Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold">UGX {scheduleForm.amount || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Frequency:</span>
                <span className="font-semibold capitalize">
                  {getFrequencyLabel(scheduleForm.frequency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {scheduleForm.frequency === 'one-time' ? 'Payment Date' : 'Next Payment'}:
                </span>
                <span className="font-semibold">
                  {scheduleForm.startDate
                    ? new Date(scheduleForm.startDate).toLocaleDateString()
                    : 'Select date'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-semibold text-blue-600">Pending</span>
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
                  'Scheduling...'
                )
              ) : (
                <>
                  {isEditing ? (
                    <Pencil className="h-4 w-4 mr-2" />
                  ) : (
                    <Calendar className="h-4 w-4 mr-2" />
                  )}
                  {isEditing ? 'Update Schedule' : 'Schedule Giving'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
