// components/StatementDatePicker.tsx
'use client';

import { useState } from 'react';
import { Calendar, X, Download, Info } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent } from '@radix-ui/react-dialog';
import { DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { format, subMonths, startOfMonth, endOfMonth, isValid } from 'date-fns';

interface StatementDatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (startDate: Date, endDate: Date) => void;
  availableMonths?: Date[]; // Months for which statements exist
}

export function StatementDatePicker({
  isOpen,
  onClose,
  onDownload,
  availableMonths = [],
}: StatementDatePickerProps) {
  const [startDate, setStartDate] = useState<Date>(() => subMonths(new Date(), 3));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [error, setError] = useState<string>('');

  const predefinedRanges = [
    { label: 'Last 30 days', start: subMonths(new Date(), 1), end: new Date() },
    { label: 'Last Quarter', start: subMonths(new Date(), 3), end: new Date() },
    { label: 'Last 6 Months', start: subMonths(new Date(), 6), end: new Date() },
    { label: 'Year to Date', start: startOfMonth(new Date()), end: new Date() },
  ];

  const validateDates = () => {
    if (!isValid(startDate) || !isValid(endDate)) {
      setError('Please select valid dates');
      return false;
    }

    if (startDate > endDate) {
      setError('Start date must be before end date');
      return false;
    }

    // Check if date range exceeds available data
    const maxRange = subMonths(new Date(), 24); // 2 years back
    if (startDate < maxRange) {
      setError('Statements are only available for the past 24 months');
      return false;
    }

    setError('');
    return true;
  };

  const handlePredefinedRange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
    setError('');
  };

  const handleDownload = () => {
    if (validateDates()) {
      onDownload(startDate, endDate);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Custom Statement Download
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Predefined Ranges */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Select</h4>
            <div className="grid grid-cols-2 gap-2">
              {predefinedRanges.map((range, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => handlePredefinedRange(range.start, range.end)}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Date Range */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Custom Range</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <input
                  type="date"
                  value={format(startDate, 'yyyy-MM-dd')}
                  onChange={(e) => setStartDate(new Date(e.target.value))}
                  className="w-full p-2 border rounded-lg text-sm"
                  max={format(endDate, 'yyyy-MM-dd')}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <input
                  type="date"
                  value={format(endDate, 'yyyy-MM-dd')}
                  onChange={(e) => setEndDate(new Date(e.target.value))}
                  className="w-full p-2 border rounded-lg text-sm"
                  min={format(startDate, 'yyyy-MM-dd')}
                  max={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start">
              <Info className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
              <div>
                <p className="text-sm text-gray-700">
                  Selected: <strong>{format(startDate, 'MMM d, yyyy')}</strong> to{' '}
                  <strong>{format(endDate, 'MMM d, yyyy')}</strong>
                </p>
                {availableMonths.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {availableMonths.length} statements available in this range
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-purple-600 to-[#B28930]"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Generate Statement
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
