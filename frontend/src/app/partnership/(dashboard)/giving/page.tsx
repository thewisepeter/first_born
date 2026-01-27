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
  Filter,
  Plus,
  History,
  Target,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { StatsCard } from '../components/StatsCard';
import { StatementDatePicker } from '../components/StatementDatePicker';
import { ScheduleGivingModal, type ScheduleFormData } from '../components/ScheduleGivingModal';
import {
  getLatestStatements,
  getLatestStatementsArray,
  downloadStatement,
  formatTimeAgo,
  generateGivingData,
  type GivingData,
} from '../data/mockData';

export default function GivingPage() {
  const [activeTab, setActiveTab] = useState('history');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<ScheduleFormData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  // Add to your existing useState declarations
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // Pagination state for giving history
  const [currentHistoryPage, setCurrentHistoryPage] = useState(0);
  const historyPerPage = 5;

  // Use mock data from centralized file
  const [givingData, setGivingData] = useState<GivingData>(generateGivingData());

  const progressPercentage = (givingData.totalGiven / givingData.monthlyGoal) * 100;
  const goalProgress = progressPercentage.toFixed(0);

  // Calculate pagination values
  const totalHistoryPages = Math.ceil(givingData.givingHistory.length / historyPerPage);

  // Get current page history items
  const getCurrentHistoryItems = () => {
    const startIndex = currentHistoryPage * historyPerPage;
    return givingData.givingHistory.slice(startIndex, startIndex + historyPerPage);
  };

  // Pagination handlers
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
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (isEditing && editingPayment) {
      // Update existing payment
      setGivingData((prev) => ({
        ...prev,
        upcomingPayments: prev.upcomingPayments.map((payment) =>
          payment.id === editingPayment.id
            ? {
                ...payment,
                ...formData,
                amount: parseInt(formData.amount),
                id: Number(payment.id),
                status: 'pending',
              }
            : payment
        ),
      }));

      alert('Scheduled payment updated successfully!');
    } else {
      // Add new payment
      const newPayment = {
        id: Number(givingData.upcomingPayments.length + 1),
        amount: parseInt(formData.amount),
        dueDate: new Date(formData.startDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        type:
          formData.purpose === 'weekly-partnership'
            ? 'Weekly Partnership'
            : formData.purpose === 'radio-broadcast'
              ? 'Radio Broadcast Support'
              : formData.purpose === 'youth-camp'
                ? 'Youth Camp Support'
                : formData.purpose === 'bible-distribution'
                  ? 'Bible Distribution'
                  : formData.purpose === 'fellowship'
                    ? 'Fellowship Support'
                    : 'General Ministry Support',
        frequency: formData.frequency,
        startDate: formData.startDate,
        paymentMethod: formData.paymentMethod,
        purpose: formData.purpose,
        notes: formData.notes,
        title:
          formData.purpose === 'weekly-partnership'
            ? 'Weekly Partnership'
            : formData.purpose === 'radio-broadcast'
              ? 'Radio Broadcast Support'
              : formData.purpose === 'youth-camp'
                ? 'Youth Camp Support'
                : formData.purpose === 'bible-distribution'
                  ? 'Bible Distribution'
                  : formData.purpose === 'fellowship'
                    ? 'Fellowship Support'
                    : 'General Ministry Support',
        status: 'pending' as const,
      };

      setGivingData((prev) => ({
        ...prev,
        upcomingPayments: [...prev.upcomingPayments, newPayment],
      }));

      alert('New scheduled payment added successfully!');
    }

    // Reset editing state
    setEditingPayment(null);
    setIsEditing(false);
  };

  // Handle edit button click
  const handleEditClick = (payment: any) => {
    // Convert payment data to ScheduleFormData format
    const formData: ScheduleFormData = {
      id: payment.id,
      amount: payment.amount.toString(),
      frequency: payment.frequency || 'weekly',
      startDate: payment.startDate || payment.dueDate.split(' ').slice(1).join(' '), // Convert date
      paymentMethod: payment.paymentMethod || 'mobile-money',
      purpose: payment.purpose || payment.type.toLowerCase().replace(/ /g, '-'),
      notes: payment.notes || '',
      title: payment.title || payment.type,
    };

    setEditingPayment(formData);
    setIsEditing(true);
    setShowScheduleModal(true);
  };

  // Handle new schedule button click
  const handleNewScheduleClick = () => {
    setEditingPayment(null);
    setIsEditing(false);
    setShowScheduleModal(true);
  };

  // Handle cancel schedule (optional functionality)
  const handleCancelSchedule = async (paymentId: number) => {
    if (confirm('Are you sure you want to cancel this scheduled payment?')) {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setGivingData((prev) => ({
        ...prev,
        upcomingPayments: prev.upcomingPayments.filter((payment) => payment.id !== paymentId),
      }));

      alert('Scheduled payment cancelled successfully!');
    }
  };

  const handlePayNow = async (paymentId: number) => {
    if (confirm('Are you sure you want to mark this payment as completed?')) {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Find the payment to move to history
      const payment = givingData.upcomingPayments.find((p) => p.id === paymentId);

      if (payment) {
        // Create a new history item
        const newHistoryItem = {
          id: givingData.givingHistory.length + 1,
          amount: payment.amount,
          date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
          type: payment.type,
          status: 'completed',
        };

        // Update the state
        setGivingData((prev) => ({
          ...prev,
          // Remove from upcoming payments
          upcomingPayments: prev.upcomingPayments.filter((p) => p.id !== paymentId),
          // Add to history
          givingHistory: [newHistoryItem, ...prev.givingHistory],
          // Update total given
          totalGiven: prev.totalGiven + payment.amount,
        }));

        alert('Payment marked as completed successfully!');
      }
    }
  };

  const handleCustomDownload = (startDate: Date, endDate: Date) => {
    console.log('Custom range:', startDate, 'to', endDate);
    // Generate statement for custom range
    setShowDatePicker(false);
  };

  const handleDownloadStatement = async (statement: any) => {
    const result = await downloadStatement(
      statement.type === 'quarterly'
        ? `q${statement.quarter}-${statement.year}`
        : `annual-${statement.year}`,
      statement.type as 'quarterly' | 'annual'
    );

    if (result.success) {
      // Record the download
      const recentDownload = {
        id: `download-${Date.now()}`,
        statementId:
          statement.id || `${statement.type}-${statement.year}-${statement.quarter || ''}`,
        statementName: statement.label,
        downloadedAt: new Date().toISOString(),
        fileSize: statement.type === 'quarterly' ? '1.1 MB' : '2.4 MB',
      };

      // Update recent downloads in state
      setGivingData((prev) => ({
        ...prev,
        recentDownloads: [recentDownload, ...(prev.recentDownloads || [])].slice(0, 5), // Keep only 5 most recent
      }));

      alert(result.message);
    } else {
      alert(`Error: ${result.message}`);
    }
  };

  // Add helper functions
  const handleQuickRange = (range: string) => {
    const today = new Date();
    const startDate = new Date();

    switch (range) {
      case 'last30':
        startDate.setDate(today.getDate() - 30);
        break;
      case 'lastQuarter':
        startDate.setMonth(today.getMonth() - 3);
        break;
      case 'last6Months':
        startDate.setMonth(today.getMonth() - 6);
        break;
      case 'yearToDate':
        startDate.setMonth(0, 1); // January 1st
        break;
    }

    setCustomStartDate(startDate.toISOString().split('T')[0]);
    setCustomEndDate(today.toISOString().split('T')[0]);
  };

  const handleCustomDateRangeSubmit = async () => {
    if (!customStartDate || !customEndDate) {
      alert('Please select both start and end dates');
      return;
    }

    const start = new Date(customStartDate);
    const end = new Date(customEndDate);

    if (start > end) {
      alert('Start date must be before end date');
      return;
    }

    // Call your existing handler
    await handleCustomDownload(start, end);
    setShowDatePicker(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Giving</h1>
        <p className="text-gray-600 mt-1">Manage and track your partnership and giving</p>
      </div>
      {/* Quick Stats - Using StatsCard component */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Given This Month"
          value={`UGX ${givingData.totalGiven.toLocaleString()}`}
          description="On track for monthly goal"
          icon={DollarSign}
          color="green"
          trend={12.5}
          trendLabel="vs last month"
          onClick={() => console.log('View total given details')}
        />

        <StatsCard
          title="Monthly Goal Progress"
          value={`${goalProgress}%`}
          description={`UGX ${givingData.monthlyGoal.toLocaleString()} target`}
          icon={Target}
          color="blue"
          trend={parseInt(goalProgress) > 85 ? 5.2 : -2.3}
          trendLabel={parseInt(goalProgress) > 85 ? 'ahead of schedule' : 'needs attention'}
          onClick={() => console.log('View goal progress details')}
        />

        <StatsCard
          title="Upcoming Payments"
          value={givingData.upcomingPayments.length.toString()}
          description="Scheduled contributions"
          icon={Calendar}
          color="purple"
          onClick={() => console.log('View upcoming payments')}
        />
      </div>
      {/* Main Content - Full Width */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <History className="h-5 w-5 mr-2 text-gray-500" />
              <CardTitle className="text-lg text-center sm:text-left">
                Giving History & Scheduled Payments
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="history" className="flex items-center">
                <History className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
              <TabsTrigger value="scheduled" className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Scheduled
              </TabsTrigger>
            </TabsList>

            {/* History Tab Content with Pagination */}
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
                        <p className="font-medium text-gray-900">{item.type}</p>
                        <p className="text-sm text-gray-500">{item.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">UGX {item.amount.toLocaleString()}</p>
                      <Badge variant="outline" className="text-green-700 border-green-200">
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {givingData.givingHistory.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No Giving History Yet</h3>
                  <p className="text-gray-500 mt-1">Your giving history will appear here</p>
                </div>
              ) : (
                // Pagination Controls for History
                totalHistoryPages > 1 && (
                  <div className="pt-6 border-t border-gray-200">
                    {/* Page Info */}
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-gray-500">
                        Showing {currentHistoryPage * historyPerPage + 1} -{' '}
                        {Math.min(
                          (currentHistoryPage + 1) * historyPerPage,
                          givingData.givingHistory.length
                        )}{' '}
                        of {givingData.givingHistory.length} transactions
                      </p>
                    </div>

                    {/* Pagination Buttons */}
                    <div className="flex items-center justify-between">
                      {/* Previous Button */}
                      <button
                        onClick={prevHistoryPage}
                        disabled={currentHistoryPage === 0}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </button>

                      {/* Page Numbers */}
                      <div className="flex items-center space-x-2">
                        {Array.from({ length: totalHistoryPages }, (_, i) => (
                          <button
                            key={i}
                            onClick={() => goToHistoryPage(i)}
                            className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                              currentHistoryPage === i
                                ? 'bg-purple-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>

                      {/* Next Button */}
                      <button
                        onClick={nextHistoryPage}
                        disabled={currentHistoryPage === totalHistoryPages - 1}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                )
              )}
            </TabsContent>

            {/* Scheduled Tab Content */}
            <TabsContent value="scheduled" className="space-y-6 mt-6">
              {/* Schedule New Giving Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleNewScheduleClick}
                  className="bg-gradient-to-r from-purple-600 to-[#B28930] hover:from-purple-700 hover:to-[#A07828]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule New Giving
                </Button>
              </div>

              {/* Scheduled Payments List */}
              <div className="rounded-lg border">
                {givingData.upcomingPayments.length > 0 ? (
                  givingData.upcomingPayments.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.type}</p>
                          <p className="text-sm text-gray-500">Due {item.dueDate}</p>
                          <p className="text-xs text-gray-400 capitalize">
                            {item.frequency} •{' '}
                            {item.paymentMethod?.replace('-', ' ') || 'mobile money'}
                          </p>
                          <Badge
                            variant="outline"
                            className={`mt-1 text-xs ${
                              item.status === 'pending'
                                ? 'text-yellow-700 border-yellow-200 bg-yellow-50'
                                : item.status === 'processing'
                                  ? 'text-blue-700 border-blue-200 bg-blue-50'
                                  : 'text-gray-700 border-gray-200 bg-gray-50'
                            }`}
                          >
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            UGX {item.amount.toLocaleString()}
                          </p>
                          <Badge variant="outline" className="text-blue-700 border-blue-200">
                            Upcoming
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditClick(item)}>
                            Edit
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
                      onClick={handleNewScheduleClick}
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
                  <Calendar className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-medium text-blue-900">About Scheduled Giving</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Scheduled payments will be processed automatically on their due dates. You can
                      edit or cancel any scheduled payment up to 24 hours before the due date.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      {/* Giving Statements */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Giving Statements</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            >
              <a href="/profile/statements">
                <History className="h-4 w-4 mr-2" />
                View All Statements
              </a>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {getLatestStatementsArray().map((statement, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start hover:bg-gray-50 transition-colors group"
                onClick={() => handleDownloadStatement(statement)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <Download className="h-4 w-4 mr-3 text-gray-400 group-hover:text-purple-600 transition-colors" />
                    <span>{statement.label}</span>
                  </div>
                  <Badge variant="outline" className="text-xs text-gray-500 border-gray-200">
                    Most Recent
                  </Badge>
                </div>
              </Button>
            ))}

            <Button
              variant="outline"
              className="w-full justify-start hover:border-purple-300 hover:bg-purple-50 transition-colors group"
              onClick={() => setShowDatePicker(true)}
            >
              <Calendar className="h-4 w-4 mr-3 text-gray-400 group-hover:text-purple-600 transition-colors" />
              <span className="text-gray-700 group-hover:text-purple-700">Custom Date Range</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      <StatementDatePicker
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onDownload={handleCustomDownload}
      />
      {/* Schedule New Giving Modal */}
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
      <Dialog open={showDatePicker} onOpenChange={setShowDatePicker}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Custom Statement Download
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Simple date range picker */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Select Date Range</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">From Date</label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">To Date</label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Quick select buttons */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Select</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => handleQuickRange('last30')}>
                  Last 30 Days
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickRange('lastQuarter')}>
                  Last Quarter
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickRange('last6Months')}>
                  Last 6 Months
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickRange('yearToDate')}>
                  Year to Date
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowDatePicker(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-purple-600 to-[#B28930]"
                onClick={handleCustomDateRangeSubmit}
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
