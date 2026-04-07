// src/app/partnership/(dashboard)/giving/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Badge } from '../../../components/ui/badge';
import {
  DollarSign,
  Calendar,
  TrendingUp,
  Download,
  Plus,
  History,
  Target,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { StatsCard } from '../components/StatsCard';
import { StatementDatePicker } from '../components/StatementDatePicker';
import { ScheduleGivingModal, type ScheduleFormData } from '../components/ScheduleGivingModal';
import { AddGivingModal, type AddGivingFormData } from '../components/AddGivingModal';
import { useGiving } from '../../../../hooks/useGiving';
import { useAuth } from '../../../../contexts/AuthContext';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function GivingPage() {
  const { user } = useAuth();
  const {
    loading,
    error,
    stats,
    history,
    historyCount,
    scheduledGivings,
    statements,
    createSchedule,
    updateSchedule,
    cancelSchedule,
    createDirectGiving,
    payNow,
    downloadStatement,
    generateCustomStatement,
    refresh,
  } = useGiving();

  // Add this near the top of your GivingPage component, after the useGiving() hook
  useEffect(() => {}, [scheduledGivings]);

  useEffect(() => {}, [history]);

  const [activeTab, setActiveTab] = useState('history');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<ScheduleFormData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [currentHistoryPage, setCurrentHistoryPage] = useState(0);
  const [showAddGivingModal, setShowAddGivingModal] = useState(false);

  const historyPerPage = 5;
  const totalHistoryPages = Math.ceil((history?.length || 0) / historyPerPage);

  // Pagination
  const getCurrentHistoryItems = () => {
    const startIndex = currentHistoryPage * historyPerPage;
    return history?.slice(startIndex, startIndex + historyPerPage) || [];
  };

  const nextHistoryPage = () => {
    setCurrentHistoryPage((prev) => (prev + 1) % totalHistoryPages);
  };

  const prevHistoryPage = () => {
    setCurrentHistoryPage((prev) => (prev - 1 + totalHistoryPages) % totalHistoryPages);
  };

  const goToHistoryPage = (page: number) => {
    setCurrentHistoryPage(page);
  };

  // Handle schedule submission
  const handleScheduleSubmit = async (formData: ScheduleFormData) => {
    const amount = parseInt(formData.amount);

    if (isEditing && formData.id) {
      // 🔴 EDIT MODE - Update existing schedule
      const result = await updateSchedule(Number(formData.id), {
        amount: amount.toString(), // ✅ Fix: Use the amount variable, not the type 'number'
        giving_type: formData.purpose,
        title: formData.title || formData.purpose,
        frequency: formData.frequency,
        start_date: formData.startDate,
        ...(formData.frequency !== 'one-time' && { end_date: null }),
      });

      if (result.success) {
        setShowScheduleModal(false);
        setEditingPayment(null);
        setIsEditing(false);
      } else {
        alert(result.error);
      }
    } else {
      // 🔴 CREATE MODE - Create new schedule
      const scheduleData: {
        amount: number;
        giving_type: string;
        title: string;
        frequency: string;
        start_date: string;
        end_date?: string | null;
      } = {
        amount: amount, // ✅ Fix: Use the amount variable
        giving_type: formData.purpose,
        title: formData.title || formData.purpose,
        frequency: formData.frequency,
        start_date: formData.startDate,
      };

      if (formData.frequency !== 'one-time') {
        scheduleData.end_date = null;
      }

      const result = await createSchedule(scheduleData);

      if (result.success) {
        setShowScheduleModal(false);
        setEditingPayment(null);
        setIsEditing(false);
      } else {
        alert(result.error);
      }
    }
  };

  // Handle edit button click
  const handleEditClick = (payment: any) => {
    const formData: ScheduleFormData = {
      id: payment.id,
      amount: payment.amount.toString(),
      frequency: payment.frequency,
      startDate: payment.next_payment_date || payment.start_date,
      purpose: payment.giving_type,
      title: payment.title,
    };

    setEditingPayment(formData);
    setIsEditing(true);
    setShowScheduleModal(true);
  };

  // Handle cancel schedule
  const handleCancelSchedule = async (id: number) => {
    const confirmed = window.confirm('Are you sure you want to cancel this scheduled payment?');

    if (!confirmed) return;

    try {
      const result = await cancelSchedule(id);

      if (result.success) {
        alert(result.message || 'Scheduled payment cancelled successfully.');

        // refresh the scheduled givings list
        refresh();
      } else {
        alert(result.error || 'Failed to cancel scheduled payment.');
      }
    } catch (error) {
      console.error('Cancel schedule error:', error);
      alert('Something went wrong while cancelling the schedule.');
    }
  };

  // Handle pay now
  const handlePayNow = async (id: number) => {
    if (confirm('Are you sure you want to mark this payment as completed?')) {
      const result = await payNow(id);
      if (result.success) {
        alert(result.message);
      } else {
        alert(result.error);
      }
    }
  };

  // Update your handleDownloadStatement function
  const handleDownloadStatement = async (statement: any) => {
    try {
      // Show loading state if desired
      const result = await downloadStatement(statement.id);
      if (result.success) {
        // Optional success message
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download statement');
    }
  };

  // Handle custom date range download
  const handleCustomDownload = async (startDate: Date, endDate: Date) => {
    try {
      // Validate dates
      if (startDate > endDate) {
        alert('Start date must be before end date');
        return;
      }

      const result = await generateCustomStatement(startDate, endDate);

      if (result.success) {
        setShowDatePicker(false);
        setCustomStartDate('');
        setCustomEndDate('');
        // Optional success message
        alert('Statement generated successfully');
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Custom download error:', error);
      alert('Failed to generate statement');
    }
  };

  const handleAddGiving = async (data: AddGivingFormData) => {
    // You'll need to add createDirectGiving to your hook
    const result = await createDirectGiving({
      amount: parseInt(data.amount),
      giving_type: data.giving_type,
      date: data.date,
      payment_method: data.payment_method,
    });

    if (result.success) {
      setShowAddGivingModal(false);
    } else {
      alert(result.error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your giving data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-800">Unable to Load Giving Data</h3>
            <p className="text-red-700 mt-1">{error}</p>
            <Button
              onClick={refresh}
              variant="outline"
              className="mt-4 border-red-300 text-red-700 hover:bg-red-100"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const goalProgress = stats?.goal_progress || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Giving</h1>
        <p className="text-gray-600 mt-1">Manage and track your partnership and giving</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Button
          onClick={() => {
            setShowAddGivingModal(true);
          }}
          variant="outline"
          className="w-full border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4 mr-2" />
          Record Giving
        </Button>

        <Button
          onClick={() => {
            setEditingPayment(null);
            setIsEditing(false);
            setShowScheduleModal(true);
          }}
          variant="outline"
          className="w-full border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4 mr-2" />
          Schedule New Giving
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatsCard
          title="Total Given This Month"
          value={formatCurrency(stats?.this_month_giving || 0)}
          description="On track for monthly goal"
          icon={DollarSign}
          color="green"
          trend={stats?.month_over_month_change || 0}
          trendLabel="vs last month"
        />

        <StatsCard
          title="Upcoming Payments"
          value={stats?.upcoming_payments?.toString() || '0'}
          description="Scheduled contributions"
          icon={Calendar}
          color="purple"
        />
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col items-center justify-center text-center gap-2">
            <div className="flex items-center justify-center">
              <CardTitle className="text-lg">Giving History & Scheduled Payments</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            key={scheduledGivings?.length}
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
              <TabsTrigger value="history" className="flex items-center">
                <History className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
              <TabsTrigger value="scheduled" className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Scheduled
              </TabsTrigger>
            </TabsList>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6 mt-6">
              <div className="rounded-lg border">
                {getCurrentHistoryItems().map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-lg bg-green-100">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.giving_type}</p>
                        <p className="text-sm text-gray-500">{formatDate(item.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(item.amount)}</p>
                      <Badge
                        variant="outline"
                        className={
                          item.status === 'completed'
                            ? 'text-green-700 border-green-200 bg-green-50'
                            : item.status === 'processing'
                              ? 'text-blue-700 border-blue-200 bg-blue-50'
                              : item.status === 'failed'
                                ? 'text-red-700 border-red-200 bg-red-50'
                                : 'text-yellow-700 border-yellow-200 bg-yellow-50'
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {history?.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No Giving History Yet</h3>
                  <p className="text-gray-500 mt-1">Your giving history will appear here</p>
                </div>
              ) : (
                totalHistoryPages > 1 && (
                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={prevHistoryPage}
                        disabled={currentHistoryPage === 0}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </button>

                      <div className="flex items-center space-x-2">
                        {Array.from({ length: totalHistoryPages }, (_, i) => (
                          <button
                            key={i}
                            onClick={() => goToHistoryPage(i)}
                            className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium ${
                              currentHistoryPage === i
                                ? 'bg-purple-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={nextHistoryPage}
                        disabled={currentHistoryPage === totalHistoryPages - 1}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                )
              )}
            </TabsContent>

            {/* Scheduled Tab */}
            <TabsContent value="scheduled" className="space-y-6 mt-6">
              <div className="rounded-lg border">
                {scheduledGivings?.filter((s) => s.status === 'active').length > 0 ? (
                  scheduledGivings
                    .filter((s) => s.status === 'active')
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="p-2 rounded-lg bg-blue-100">
                            <Calendar className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-gray-900">{item.title}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Next Payment:{' '}
                              <span className="font-medium">
                                {formatDate(item.next_payment_date)}
                              </span>
                            </p>

                            {item.days_until_next !== null && item.days_until_next > 0 && (
                              <p className="text-xs text-gray-500">
                                in {item.days_until_next} days
                              </p>
                            )}

                            <Badge
                              variant="outline"
                              className="mt-2 text-xs text-yellow-700 border-yellow-200 bg-yellow-50"
                            >
                              {item.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(Number(item.amount))}
                          </p>

                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs px-2 py-1"
                              onClick={() => handleEditClick(item)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="text-xs px-2 py-1"
                              onClick={() => handleCancelSchedule(item.id)}
                            >
                              Delete
                            </Button>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-purple-600 to-[#B28930] hover:from-purple-700 hover:to-[#A07828]"
                              onClick={() => handlePayNow(item.id)}
                            >
                              Pay Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No Scheduled Payments</h3>
                    <p className="text-gray-500 mt-1 mb-4">You don't have any scheduled payments</p>
                    <Button
                      onClick={() => {
                        setEditingPayment(null);
                        setIsEditing(false);
                        setShowScheduleModal(true);
                      }}
                      variant="outline"
                      className="border-purple-600 text-purple-600 hover:bg-purple-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Your First Payment
                    </Button>
                  </div>
                )}
              </div>

              {/* Help Text */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div>
                    <h4 className="font-medium text-blue-900">Psalm 50:14-15</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Offer to God the sacriﬁce of thanksgiving, and pay your vows to the Most High,
                      And call on Me in the day of trouble; I will deliver you, and you shall honor
                      and glorify Me.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Giving Statements */}
      <Card>
        <CardHeader>
          <div className="flex font-bold items-center justify-center">
            <CardTitle>Download Giving Statements</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {statements?.slice(0, 3).map((statement) => (
              <Button
                key={statement.id}
                variant="outline"
                className="w-full justify-start hover:bg-gray-50 transition-colors group"
                onClick={() => handleDownloadStatement(statement)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <Download className="h-4 w-4 mr-3 text-gray-400 group-hover:text-purple-600 transition-colors" />
                    <span>{statement.period_display}</span>
                  </div>
                  <Badge variant="outline" className="text-xs text-gray-500 border-gray-200">
                    {formatCurrency(statement.total_amount)}
                  </Badge>
                </div>
              </Button>
            ))}

            {/* Center this button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                className=" border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setShowDatePicker(true)}
              >
                <Calendar />
                <span>Enter Date Range</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Giving Modal */}
      <ScheduleGivingModal
        isOpen={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false);
          setEditingPayment(null);
          setIsEditing(false);
        }}
        onSubmit={handleScheduleSubmit}
        initialData={editingPayment}
        isEditing={isEditing}
      />

      {/* Add Giving Modal */}
      <AddGivingModal
        isOpen={showAddGivingModal}
        onClose={() => setShowAddGivingModal(false)}
        onSubmit={handleAddGiving}
      />

      {/* Custom Date Picker Dialog */}
      <Dialog open={showDatePicker} onOpenChange={setShowDatePicker}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex items-center justify-center text-center">
            <DialogTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Giving Statement Download
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-purple-500 mb-1">From Date</label>
                  <input
                    type="date"
                    className="w-full p-2 border border-purple-600 rounded-lg text-sm text-purple-500"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-purple-500 mb-1">To Date</label>
                  <input
                    type="date"
                    className="w-full p-2 border border-purple-600 rounded-lg text-sm text-purple-500"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowDatePicker(false)}>
                Cancel
              </Button>
              <Button
                variant="outline"
                className=" border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  if (customStartDate && customEndDate) {
                    handleCustomDownload(new Date(customStartDate), new Date(customEndDate));
                  }
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Generate Statement
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
