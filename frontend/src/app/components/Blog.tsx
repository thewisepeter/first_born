'use client';

import { useState } from 'react';
import {
  Calendar,
  User,
  Heart,
  MessageSquare,
  Share2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  likes: number;
  comments: number;
  image: string;
  tags: string[];
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Walking in Faith: A Journey of Trust and Surrender',
    excerpt:
      "Discover the transformative power of walking by faith and not by sight. Learn how surrendering to God's plan can lead to breakthrough and peace.",
    content:
      'Faith is not just a feeling, but an active choice to trust God even when we cannot see the full picture...',
    author: 'Pastor John Smith',
    date: 'February 5, 2024',
    category: 'Faith & Spirituality',
    readTime: '5 min read',
    likes: 127,
    comments: 23,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
    tags: ['Faith', 'Trust', 'Spiritual Growth'],
  },
  {
    id: '2',
    title: 'The Power of Community: Building Stronger Relationships',
    excerpt:
      "Explore how meaningful connections within our church family can strengthen our faith and provide support during life's challenges.",
    content:
      'Community is at the heart of the Christian experience. When we come together in fellowship...',
    author: 'Sarah Johnson',
    date: 'January 28, 2024',
    category: 'Community',
    readTime: '7 min read',
    likes: 89,
    comments: 16,
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop',
    tags: ['Community', 'Fellowship', 'Relationships'],
  },
  {
    id: '3',
    title: "Finding Hope in Difficult Times: God's Promise of Restoration",
    excerpt:
      "When life feels overwhelming, discover how God's promises can provide hope and strength for the journey ahead.",
    content:
      'Difficult seasons are part of the human experience, but as believers, we have access to supernatural hope...',
    author: 'Pastor John Smith',
    date: 'January 21, 2024',
    category: 'Hope & Encouragement',
    readTime: '6 min read',
    likes: 156,
    comments: 34,
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop',
    tags: ['Hope', 'Encouragement', "God's Promises"],
  },
  {
    id: '4',
    title: 'The Joy of Serving: Discovering Your Purpose in Ministry',
    excerpt:
      "Learn how serving others can transform your life and help you discover God's unique calling on your life.",
    content:
      "Service is not just about helping others; it's about finding your purpose and experiencing the joy that comes...",
    author: 'Michael Davis',
    date: 'January 14, 2024',
    category: 'Ministry & Service',
    readTime: '4 min read',
    likes: 73,
    comments: 12,
    image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&h=400&fit=crop',
    tags: ['Service', 'Ministry', 'Purpose'],
  },
  {
    id: '5',
    title: 'Prayer That Changes Everything: Moving Mountains Through Faith',
    excerpt:
      'Unlock the power of prayer and learn how to develop a deeper, more meaningful prayer life that brings real transformation.',
    content:
      'Prayer is our direct line of communication with God, yet many struggle to maintain consistency...',
    author: 'Rebecca Martinez',
    date: 'January 7, 2024',
    category: 'Prayer & Worship',
    readTime: '8 min read',
    likes: 201,
    comments: 45,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=400&fit=crop',
    tags: ['Prayer', 'Worship', 'Spiritual Discipline'],
  },
  {
    id: '6',
    title: "Christmas Reflections: The Gift of God's Love",
    excerpt:
      "Reflect on the true meaning of Christmas and how God's incredible gift of love continues to transform lives today.",
    content:
      "Christmas is more than a holiday; it's a celebration of God's incredible love demonstrated through Jesus...",
    author: 'Pastor John Smith',
    date: 'December 24, 2023',
    category: 'Seasonal Reflections',
    readTime: '5 min read',
    likes: 298,
    comments: 67,
    image: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=600&h=400&fit=crop',
    tags: ['Christmas', "God's Love", 'Reflection'],
  },
];

export function Blog() {
  const [currentPage, setCurrentPage] = useState(0);
  const postsPerPage = 3;
  const totalPages = Math.ceil(blogPosts.length / postsPerPage);

  const getCurrentPosts = () => {
    const startIndex = currentPage * postsPerPage;
    return blogPosts.slice(startIndex, startIndex + postsPerPage);
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

  return (
    <div className="min-h-screen bg-white">
      {/* Blog Posts Grid Section */}
      <section className="py-16 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Church Blog</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover inspiring articles, spiritual insights, and practical guidance for your faith
              journey from our church community.
            </p>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {getCurrentPosts().map((post) => (
              <Card
                key={post.id}
                className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg overflow-hidden bg-white"
              >
                {/* Blog Post Image */}
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                  <ImageWithFallback
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-purple-600 text-white hover:bg-purple-700">
                      {post.category}
                    </Badge>
                  </div>

                  {/* Read Time */}
                  <div className="absolute bottom-4 right-4 bg-black/80 text-white px-2 py-1 rounded text-sm flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {post.readTime}
                  </div>
                </div>

                {/* Blog Post Content */}
                <CardContent className="p-6">
                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors leading-tight">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>

                  {/* Author and Date */}
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <User className="h-3 w-3 mr-1" />
                    <span className="mr-4">{post.author}</span>
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{post.date}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.tags.slice(0, 2).map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs bg-[#F5F0E1] text-[#B28930] hover:bg-[#B28930] hover:text-white"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Engagement Stats and Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Heart className="h-3 w-3 mr-1" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        <span>{post.comments}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white text-xs px-3"
                      >
                        <BookOpen className="h-3 w-3 mr-1" />
                        Read
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#B28930] text-[#B28930] hover:bg-[#B28930] hover:text-white text-xs px-3"
                      >
                        <Share2 className="h-3 w-3 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-4">
              {/* Previous Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={prevPage}
                disabled={currentPage === 0}
                className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              {/* Page Numbers */}
              <div className="flex items-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => goToPage(i)}
                    className={
                      currentPage === i
                        ? 'bg-[#B28930] hover:bg-[#9A7328] text-white'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>

              {/* Next Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={nextPage}
                disabled={currentPage === totalPages - 1}
                className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}

          {/* Page Info */}
          <div className="text-center mt-4">
            <p className="text-gray-500 text-sm">
              Showing {currentPage * postsPerPage + 1} -{' '}
              {Math.min((currentPage + 1) * postsPerPage, blogPosts.length)} of {blogPosts.length}{' '}
              blog posts
            </p>
          </div>
        </div>
      </section>

      {/* Featured Author Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Contributing Author</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-[#B28930] rounded-full mx-auto" />
            </div>

            <div className="flex justify-center">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center max-w-md w-full">
                <CardHeader className="pb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-6">
                    <User className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Pastor John Smith</h3>
                  <p className="text-lg text-gray-600">Senior Pastor</p>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <p className="text-gray-600 leading-relaxed">
                    Leading our congregation with wisdom and compassion, Pastor John shares insights
                    from 25+ years of ministry experience. His articles focus on practical faith
                    applications, spiritual growth, and building stronger communities through
                    Christ-centered living.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
