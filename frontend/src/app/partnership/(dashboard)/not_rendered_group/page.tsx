// src/app/partnership/(dashboard)/group/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import {
  Users,
  User,
  Mail,
  MapPin,
  Phone,
  Calendar,
  Target,
  Award,
  TrendingUp,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Heart,
  Globe,
  Building,
  Shield,
  Sparkles,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Progress } from '../../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';

// Mock data for group members
const GROUP_DATA = {
  'Group 1': {
    name: 'Group 1',
    leader: { id: 1, name: 'David Kato', role: 'Group Leader' },
    stats: {
      totalMembers: 12,
      totalGiven: 28500000,
      growth: 15.3,
    },
    members: [
      {
        id: 1,
        name: 'David Kato',
        role: 'Group Leader',
        email: 'david.kato@example.com',
        phone: '+256 772 123 456',
        location: 'Kampala Central',
        community: 'Makerere',
        bio: 'Passionate about evangelism and youth ministry. Serving as group leader for 2 years.',
        joinDate: '2023-01-15',
        totalGiven: 8500000,
        drivesSupported: 8,

        avatarColor: 'from-blue-600 to-blue-400',
      },
      {
        id: 2,
        name: 'Sarah Nalwoga',
        role: 'Prayer Coordinator',
        email: 'sarah.nalwoga@example.com',
        phone: '+256 752 234 567',
        location: 'Entebbe',
        community: 'Entebbe Catholic',
        bio: 'Intercessor with a heart for revival. Coordinates prayer meetings and fasting programs.',
        joinDate: '2023-03-20',
        totalGiven: 5200000,

        avatarColor: 'from-purple-600 to-pink-400',
      },
      {
        id: 3,
        name: 'John Mugisha',
        role: 'Outreach Leader',
        email: 'john.mugisha@example.com',
        phone: '+256 782 345 678',
        location: 'Jinja',
        community: 'Jinja Pentecostal',
        bio: 'Organizes community outreach programs and street evangelism. Passionate about discipleship.',
        joinDate: '2023-02-10',
        totalGiven: 4200000,

        avatarColor: 'from-green-600 to-emerald-400',
      },
      {
        id: 4,
        name: 'Grace Akello',
        role: 'Treasurer',
        email: 'grace.akello@example.com',
        phone: '+256 712 456 789',
        location: 'Mbarara',
        community: 'Mbarara Christian',
        bio: 'Manages group finances and giving reports. Background in accounting and stewardship.',
        joinDate: '2023-04-05',
        totalGiven: 3800000,

        avatarColor: 'from-orange-600 to-yellow-400',
      },
      {
        id: 5,
        name: 'Peter Okello',
        role: 'Media Coordinator',
        email: 'peter.okello@example.com',
        phone: '+256 792 567 890',
        location: 'Gulu',
        community: 'Gulu Worship Centre',
        bio: 'Handles social media and content creation for the group. Tech enthusiast and photographer.',
        joinDate: '2023-05-12',
        totalGiven: 3200000,

        avatarColor: 'from-red-600 to-orange-400',
      },
    ],
  },
};

export default function GroupPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('members');
  const [currentPage, setCurrentPage] = useState(0);

  // In a real app, this would come from user data
  const currentUserGroup = 'Group 1';
  const groupData = GROUP_DATA[currentUserGroup as keyof typeof GROUP_DATA];

  const membersPerPage = 6;
  const totalPages = Math.ceil(groupData.members.length / membersPerPage);

  // Filter members based on search query
  const filteredMembers = groupData.members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.community.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCurrentMembers = () => {
    const startIndex = currentPage * membersPerPage;
    return filteredMembers.slice(startIndex, startIndex + membersPerPage);
  };

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    if (!user) return;

    const loadData = () => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 800);
    };

    loadData();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading group information...</p>
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
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{groupData.name}</h1>
          </div>
          <p className="text-gray-600">Connect with fellow partners in {groupData.name}</p>
        </div>
      </div>

      {/* Combined Group Description with Stats - Alternative Layout */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{groupData.name}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {groupData.leader.role}: {groupData.leader.name}
              </p>
            </div>
            <Badge variant="outline" className="border-purple-200 text-purple-700">
              <Shield className="h-3 w-3 mr-1" />
              Active Group
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Stats Section - Top Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Members</p>
                    <h3 className="text-lg font-bold text-gray-900">
                      {groupData.stats.totalMembers}
                    </h3>
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-xs text-green-600 mt-2">Active community</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Group Total Given</p>
                    <h3 className="text-lg font-bold text-gray-900">
                      UGX {groupData.stats.totalGiven.toLocaleString()}
                    </h3>
                  </div>
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-xs text-blue-600 mt-2">Collective impact</p>
              </div>
            </div>

            {/* Description Section */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">About This Group</h3>
              <p className="text-gray-600">
                {groupData.name} is a vibrant community of partners united by a common vision to
                support ministry work across Uganda. Through collective giving, prayer, and outreach
                initiatives, members work together to amplify their impact and support various
                evangelism projects.
              </p>
              <div className="mt-4 flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                <span>Meets: Every 2nd Saturday</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Group Members</h2>
            <p className="text-gray-600">Connect with fellow partners in your group</p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Members Grid - Compact Version */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getCurrentMembers().map((member) => (
            <Card key={member.id} className="hover:shadow-md transition-shadow overflow-hidden">
              {/* Compact Header */}
              <div className="p-3 space-y-2">
                {/* Name and Role in one line */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0">
                    <div
                      className={`h-8 w-8 bg-gradient-to-r ${member.avatarColor} rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0`}
                    >
                      {member.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {member.name}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">{member.role}</p>
                    </div>
                  </div>
                  {member.id === user.id && (
                    <Badge className="bg-gradient-to-r from-purple-600 to-[#B28930] text-white text-xs px-2 py-0.5">
                      You
                    </Badge>
                  )}
                </div>

                {/* Location and Community in one line */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center text-gray-500">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="truncate max-w-[100px]">{member.location}</span>
                  </div>
                </div>

                {/* Contact Info - Compact */}
                <div className="flex flex-col gap-1 text-xs">
                  <a
                    href={`mailto:${member.email}`}
                    className="flex items-center text-gray-500 hover:text-purple-600 transition-colors truncate max-w-[120px]"
                  >
                    <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </a>
                  <a
                    href={`tel:${member.phone}`}
                    className="flex items-center text-gray-500 hover:text-purple-600 transition-colors"
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    <span>{member.phone}</span>
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination Controls - Keep as is or make more compact */}
        {totalPages > 1 && (
          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                Showing {currentPage * membersPerPage + 1} -{' '}
                {Math.min((currentPage + 1) * membersPerPage, filteredMembers.length)} of{' '}
                {filteredMembers.length} members
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Button
                onClick={prevPage}
                disabled={currentPage === 0}
                variant="outline"
                className="border-gray-300 text-xs py-1.5 h-8"
              >
                <ChevronLeft className="h-3 w-3 mr-1" />
                Previous
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i}
                    onClick={() => goToPage(i)}
                    variant={currentPage === i ? 'default' : 'outline'}
                    className={
                      currentPage === i
                        ? 'bg-gradient-to-r from-purple-600 to-[#B28930] text-white text-xs w-8 h-8 p-0'
                        : 'border-gray-300 text-xs w-8 h-8 p-0'
                    }
                    size="sm"
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>

              <Button
                onClick={nextPage}
                disabled={currentPage === totalPages - 1}
                variant="outline"
                className="border-gray-300 text-xs py-1.5 h-8"
              >
                Next
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Spiritual Footer */}
      <footer className="text-center py-12 border-t border-gray-100">
        <blockquote className="text-xl italic text-gray-600 mb-4 max-w-2xl mx-auto font-medium">
          "For where two or three gather in my name, there am I with them."
        </blockquote>
        <p className="font-bold text-gray-900">— Matthew 18:20</p>
      </footer>
    </div>
  );
}
