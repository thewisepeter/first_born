// src/app/partnership/(dashboard)/profile/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit2,
  Save,
  X,
  Shield,
  Globe,
  Building,
  CreditCard,
  Target,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  History,
  Plus,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Progress } from '../../../components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { StatementDatePicker } from '../components/StatementDatePicker';
import { getLatestStatementsArray, downloadStatement } from '../data/mockData';
import { GoalSettingModal, type GoalFormData } from '../components/GoalSettingModal';

export default function ProfilePage() {
  const { user, isLoading: authLoading, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '+256 700 000 000',
    location: user?.location || 'Kampala, Uganda',
    organization: user?.organization || 'Individual Partner',
    joinDate: user?.joinDate || '2024-01-15',
    bio:
      user?.bio ||
      'Passionate about spreading the gospel and supporting ministry work across Uganda.',
    preferences: {
      emailNotifications: true,
      smsNotifications: true,
      weeklyReports: true,
      monthlyStatements: true,
    },
  });

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalFormData | null>(null);
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  const [partnerStats, setPartnerStats] = useState({
    partnershipTier: 'Gold Partner',
    impactScore: 85,
    totalGiven: 4250000,
    drivesSupported: 12,
    monthsActive: 11,
    completionRate: 92,
    badges: [
      { id: 1, name: 'Early Supporter', icon: '🏅', earned: '2024-01-15' },
      { id: 2, name: 'Consistent Giver', icon: '💎', earned: '2024-03-20' },
      { id: 3, name: 'Drive Champion', icon: '🚀', earned: '2024-06-10' },
      { id: 4, name: 'Prayer Warrior', icon: '🙏', earned: '2024-08-05' },
    ],
    goals: [
      {
        id: 1,
        name: 'Monthly Giving Goal',
        target: 500000,
        current: 425000,
        deadline: '2024-12-31',
      },
      { id: 2, name: 'New Partners Referred', target: 5, current: 3, deadline: '2024-12-31' },
      { id: 3, name: 'Prayer Hours', target: 50, current: 42, deadline: '2024-12-31' },
    ],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePreferenceChange = (key: keyof typeof formData.preferences) => {
    setFormData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: !prev.preferences[key],
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In a real app, you would call updateProfile from your AuthContext
      // await updateProfile(formData);

      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '+256 700 000 000',
      location: user?.location || 'Kampala, Uganda',
      organization: user?.organization || 'Individual Partner',
      joinDate: user?.joinDate || '2024-01-15',
      bio:
        user?.bio ||
        'Passionate about spreading the gospel and supporting ministry work across Uganda.',
      preferences: {
        emailNotifications: true,
        smsNotifications: true,
        weeklyReports: true,
        monthlyStatements: true,
      },
    });
    setIsEditing(false);
  };

  const handleDownloadStatement = async (statement: any) => {
    const result = await downloadStatement(
      statement.type === 'quarterly'
        ? `q${statement.quarter}-${statement.year}`
        : `annual-${statement.year}`,
      statement.type as 'quarterly' | 'annual'
    );

    if (result.success) {
      alert(result.message);
    } else {
      alert(`Error: ${result.message}`);
    }
  };

  const handleCustomDownload = (startDate: Date, endDate: Date) => {
    console.log('Custom range:', startDate, 'to', endDate);
    // Generate statement for custom range
    setShowDatePicker(false);
  };

  // Add these helper functions for date range selection
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

    await handleCustomDownload(start, end);
    setShowDatePicker(false);
  };

  const handleGoalSubmit = async (formData: GoalFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (isEditingGoal && editingGoal) {
      // Update existing goal
      setPartnerStats((prev) => ({
        ...prev,
        goals: prev.goals.map((goal) =>
          goal.id === editingGoal.id
            ? {
                ...goal,
                name: formData.name,
                target: parseInt(formData.target),
                current: parseInt(formData.current),
                deadline: formData.deadline,
              }
            : goal
        ),
      }));
      alert('Goal updated successfully!');
    } else {
      // Add new goal
      const newGoal = {
        id: partnerStats.goals.length + 1,
        name: formData.name,
        target: parseInt(formData.target),
        current: parseInt(formData.current),
        deadline: formData.deadline,
      };

      setPartnerStats((prev) => ({
        ...prev,
        goals: [...prev.goals, newGoal],
      }));
      alert('New goal created successfully!');
    }

    setEditingGoal(null);
    setIsEditingGoal(false);
  };

  const handleEditGoalClick = (goal: any) => {
    const formData: GoalFormData = {
      id: goal.id,
      name: goal.name,
      target: goal.target.toString(),
      current: goal.current.toString(),
      deadline: goal.deadline,
      category: 'financial', // Default category
      description: '',
    };

    setEditingGoal(formData);
    setIsEditingGoal(true);
    setShowGoalModal(true);
  };

  const handleDeleteGoal = async (goalId: number) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setPartnerStats((prev) => ({
        ...prev,
        goals: prev.goals.filter((goal) => goal.id !== goalId),
      }));

      alert('Goal deleted successfully!');
    }
  };

  const handleSetNewGoalClick = () => {
    setEditingGoal(null);
    setIsEditingGoal(false);
    setShowGoalModal(true);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information and preferences</p>
        </div>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className="border-gray-300"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-[#B28930] hover:from-purple-700 hover:to-[#A07828]"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-r from-purple-600 to-[#B28930] hover:from-purple-700 hover:to-[#A07828]"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="personal">
            <User className="h-4 w-4 mr-2" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="partnership">
            <Shield className="h-4 w-4 mr-2" />
            Partnership
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Globe className="h-4 w-4 mr-2" />
            Preferences
          </TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-6 mt-6">
          {/* Profile Picture Card - Full width on top */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Your profile image across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="h-32 w-32 bg-gradient-to-r from-purple-600 to-[#B28930] rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4">
                  {user.firstName.charAt(0)}
                  {user.lastName.charAt(0)}
                </div>
                {isEditing && (
                  <Button variant="outline" size="sm" className="mt-2">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                )}
                <div className="mt-4 text-center">
                  <h3 className="font-bold text-gray-900">
                    {formData.firstName} {formData.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{partnerStats.partnershipTier}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information Card - Full width below */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                      />
                    ) : (
                      <p className="p-3 bg-gray-50 rounded-lg">{formData.firstName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                      />
                    ) : (
                      <p className="p-3 bg-gray-50 rounded-lg">{formData.lastName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                      />
                    ) : (
                      <p className="p-3 bg-gray-50 rounded-lg">{formData.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    ) : (
                      <p className="p-3 bg-gray-50 rounded-lg">{formData.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Location
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    ) : (
                      <p className="p-3 bg-gray-50 rounded-lg">{formData.location}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Building className="h-4 w-4 mr-2" />
                      Organization
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="organization"
                        value={formData.organization}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    ) : (
                      <p className="p-3 bg-gray-50 rounded-lg">{formData.organization}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Bio</label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Tell us about yourself and your passion for ministry..."
                    />
                  ) : (
                    <p className="p-3 bg-gray-50 rounded-lg whitespace-pre-line">{formData.bio}</p>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Partnership Information Tab */}
        <TabsContent value="partnership" className="space-y-6 mt-6">
          {/* Partnership Stats Card - Full width on top */}
          <Card>
            <CardHeader>
              <CardTitle>Partnership Status</CardTitle>
              <CardDescription>Your partnership overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="text-gray-700">Tier</span>
                  </div>
                  <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                    {partnerStats.partnershipTier}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="text-gray-700">Impact Score</span>
                  </div>
                  <span className="font-bold text-gray-900">{partnerStats.impactScore}/100</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="text-gray-700">Total Given</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    UGX {partnerStats.totalGiven.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Target className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="text-gray-700">Drives Supported</span>
                  </div>
                  <span className="font-bold text-gray-900">{partnerStats.drivesSupported}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="text-gray-700">Member Since</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {new Date(formData.joinDate).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="text-gray-700">Completion Rate</span>
                  </div>
                  <span className="font-bold text-gray-900">{partnerStats.completionRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badges Card - Full width in middle */}
          <Card>
            <CardHeader>
              <CardTitle>Badges & Achievements</CardTitle>
              <CardDescription>Your ministry partnership milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {partnerStats.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-3xl mb-2">{badge.icon}</span>
                    <p className="font-medium text-gray-900 text-center">{badge.name}</p>
                    <p className="text-xs text-gray-500 text-center mt-1">
                      Earned{' '}
                      {new Date(badge.earned).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                    <Badge variant="outline" className="mt-2 text-green-700 border-green-200">
                      Achieved
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Goals Card - Full width */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Current Goals</CardTitle>
                  <CardDescription>Track your partnership objectives</CardDescription>
                </div>
                <Button
                  onClick={handleSetNewGoalClick}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-[#B28930] hover:from-purple-700 hover:to-[#A07828]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Set New Goal
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {partnerStats.goals.map((goal) => {
                  const progress = (goal.current / goal.target) * 100;
                  return (
                    <div
                      key={goal.id}
                      className="space-y-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">{goal.name}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-purple-700 border-purple-200">
                            {goal.current.toLocaleString()} / {goal.target.toLocaleString()}
                          </Badge>
                          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditGoalClick(goal)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteGoal(goal.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{progress.toFixed(0)}% complete</span>
                        <span>
                          Due{' '}
                          {new Date(goal.deadline).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {partnerStats.goals.length === 0 && (
                  <div className="text-center py-12">
                    <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No Goals Set</h3>
                    <p className="text-gray-500 mt-1 mb-4">
                      Start tracking your partnership progress by setting goals
                    </p>
                    <Button
                      onClick={handleSetNewGoalClick}
                      className="bg-gradient-to-r from-purple-600 to-[#B28930] hover:from-purple-700 hover:to-[#A07828]"
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Set Your First Goal
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Giving Statements Card - New section below Goals */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Giving Statements</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  onClick={() => {
                    /* Navigate to full statements page */
                  }}
                >
                  <History className="h-4 w-4 mr-2" />
                  View All Statements
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
                  <span className="text-gray-700 group-hover:text-purple-700">
                    Custom Date Range
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control how and when you receive updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Email Notifications */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-purple-600 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Receive updates via email</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.preferences.emailNotifications}
                      onChange={() => handlePreferenceChange('emailNotifications')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {/* SMS Notifications */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-purple-600 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                      <p className="text-sm text-gray-500">Receive important updates via SMS</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.preferences.smsNotifications}
                      onChange={() => handlePreferenceChange('smsNotifications')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {/* Weekly Reports */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-purple-600 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900">Weekly Reports</h4>
                      <p className="text-sm text-gray-500">
                        Receive weekly giving and impact reports
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.preferences.weeklyReports}
                      onChange={() => handlePreferenceChange('weeklyReports')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {/* Monthly Statements */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-purple-600 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900">Monthly Statements</h4>
                      <p className="text-sm text-gray-500">Receive monthly giving statements</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.preferences.monthlyStatements}
                      onChange={() => handlePreferenceChange('monthlyStatements')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Update Payment Methods
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:border-red-200"
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Request Account Deletion
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <StatementDatePicker
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onDownload={handleCustomDownload}
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

      {/* Goal Setting Modal */}
      <GoalSettingModal
        isOpen={showGoalModal}
        onClose={() => {
          setShowGoalModal(false);
          setEditingGoal(null);
          setIsEditingGoal(false);
        }}
        onSubmit={handleGoalSubmit}
        initialData={editingGoal}
        isEditing={isEditingGoal}
      />

      {/* Spiritual Footer */}
      <footer className="text-center py-8 border-t border-gray-100">
        <blockquote className="text-lg italic text-gray-600 mb-4 max-w-2xl mx-auto font-medium">
          "But you are a chosen people, a royal priesthood, a holy nation, God's special possession,
          that you may declare the praises of him who called you out of darkness into his wonderful
          light."
        </blockquote>
        <p className="font-bold text-gray-900">— 1 Peter 2:9</p>
      </footer>
    </div>
  );
}
