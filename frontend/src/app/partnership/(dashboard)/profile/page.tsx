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
  Building,
  Loader2,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';

export default function ProfilePage() {
  const { user, isLoading: authLoading, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get data from user and partner_profile
  const partnerProfile = user?.partner_profile;

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: partnerProfile?.location || '',
    organization: partnerProfile?.organization || '',
    joinDate: partnerProfile?.member_since || partnerProfile?.joined_at || '',
    bio: partnerProfile?.bio || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        bio: formData.bio,
        location: formData.location,
        organization: formData.organization,
      });

      if (result.success) {
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: partnerProfile?.location || '',
      organization: partnerProfile?.organization || '',
      joinDate: partnerProfile?.member_since || partnerProfile?.joined_at || '',
      bio: partnerProfile?.bio || '',
    });
    setIsEditing(false);
    setError(null);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Format member since date
  const memberSince = partnerProfile?.member_since
    ? new Date(partnerProfile.member_since).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      })
    : 'Not available';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user.firstName} {user.lastName}'s Profile
          </h1>
          <p className="text-gray-600 mt-1">Manage your personal information</p>
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
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Profile Picture Card */}
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
              <p className="text-sm text-gray-500">
                {partnerProfile?.partner_type === 'individual'
                  ? 'Individual Partner'
                  : 'Business Partner'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information Card */}
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
                <p className="p-3 bg-gray-50 rounded-lg">{formData.email}</p>
                <p className="text-xs text-gray-500">Email cannot be changed</p>
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
                  <p className="p-3 bg-gray-50 rounded-lg">{formData.phone || 'Not provided'}</p>
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
                    value={formData.location || ''}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Your city, country"
                  />
                ) : (
                  <p className="p-3 bg-gray-50 rounded-lg">{formData.location || 'Not provided'}</p>
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
                    value={formData.organization || ''}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Your organization or company"
                  />
                ) : (
                  <p className="p-3 bg-gray-50 rounded-lg">
                    {formData.organization || 'Not provided'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Member Since
                </label>
                <p className="p-3 bg-gray-50 rounded-lg">{memberSince}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Bio</label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Tell us about yourself and your passion for ministry..."
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg whitespace-pre-line">
                  {formData.bio || 'No bio provided'}
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

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
