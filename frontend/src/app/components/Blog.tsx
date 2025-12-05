'use client';

import { useState, useEffect } from 'react';
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
  X,
  ArrowLeft,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';
import { ImageWithFallback } from './figma/ImageWithFallback';

// Update interface to accept both string and string[] for content
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string | string[]; // Changed to accept both string and array
  author: string;
  date: string;
  status: string;
  category: string;
  readTime: string;
  likes: number;
  comments: number;
  image: string;
  tags: string[];
}

export function Blog() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const postsPerPage = 3;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
        const response = await fetch(`${API_URL}/blog/blogposts/`);
        const data = await response.json();
        const publishedPosts = data.filter((post: BlogPost) => post.status === 'Published');
        setBlogPosts(publishedPosts);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

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

  const handleReadPost = (post: BlogPost) => {
    setSelectedBlogPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBlogPost(null);
  };

  // Helper function to format content into paragraphs
  const formatContent = (content: string | string[]): string[] => {
    if (Array.isArray(content)) {
      // If it's already an array, return it
      return content.filter((paragraph) => paragraph.trim().length > 0);
    }

    if (typeof content === 'string') {
      // If it's a string, try different splitting methods
      // First try double newlines
      const doubleNewlineSplit = content.split(/\n\s*\n/);
      if (
        doubleNewlineSplit.length > 1 ||
        (doubleNewlineSplit.length === 1 && doubleNewlineSplit[0] !== content)
      ) {
        return doubleNewlineSplit.filter((p) => p.trim().length > 0);
      }

      // Then try single newlines
      const singleNewlineSplit = content.split('\n');
      if (singleNewlineSplit.length > 1) {
        return singleNewlineSplit.filter((p) => p.trim().length > 0);
      }

      // If no newlines found, return as single paragraph
      return content.trim() ? [content] : [];
    }

    return [];
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Blog Posts Grid Section */}
      <section className="py-16 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Prophet's Blog</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover inspiring articles, spiritual insights, and practical guidance for your faith
              journey from Prophet Namara Ernest
            </p>
          </div>

          {/* Blog Posts Grid or Loader */}
          {loading ? (
            <p className="text-center text-gray-500">Loading blog posts...</p>
          ) : blogPosts.length === 0 ? (
            <p className="text-center text-gray-500">No published blog posts available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {getCurrentPosts().map((post) => (
                <Card
                  key={post.id}
                  className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg overflow-hidden bg-white"
                >
                  <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                    <ImageWithFallback
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-purple-600 text-white hover:bg-purple-700">
                        {post.category}
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-black/80 text-white px-2 py-1 rounded text-sm flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {post.readTime}
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 mb-4">
                      <User className="h-3 w-3 mr-1" />
                      <span className="mr-4">{post.author}</span>
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{post.date}</span>
                    </div>
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
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        {/* Commented out like/comment counters */}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReadPost(post)}
                          className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white text-xs px-3 transition-all duration-200"
                        >
                          <BookOpen className="h-3 w-3 mr-1" />
                          Read
                        </Button>
                        {/* Commented out share button */}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && !loading && (
            <div className="flex items-center justify-center space-x-4">
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
          {!loading && blogPosts.length > 0 && (
            <div className="text-center mt-4">
              <p className="text-gray-500 text-sm">
                Showing {currentPage * postsPerPage + 1} -{' '}
                {Math.min((currentPage + 1) * postsPerPage, blogPosts.length)} of {blogPosts.length}{' '}
                blog posts
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Modal Section */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl w-[95%] max-h-[90vh] p-0 flex flex-col">
          {selectedBlogPost && (
            <>
              <DialogHeader className="flex-shrink-0 bg-white z-10 border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCloseModal}
                      className="h-8 w-8 p-0 hover:bg-gray-100"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Badge className="bg-purple-600 text-white">{selectedBlogPost.category}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCloseModal}
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="relative aspect-[16/9] bg-gray-100">
                  <ImageWithFallback
                    src={selectedBlogPost.image}
                    alt={selectedBlogPost.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <div className="flex items-center space-x-4 text-sm mb-2">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        <span>{selectedBlogPost.author}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{selectedBlogPost.date}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{selectedBlogPost.readTime}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
                    {selectedBlogPost.title}
                  </h1>
                  <div className="flex flex-wrap gap-2 mb-6 md:mb-8">
                    {selectedBlogPost.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-[#F5F0E1] text-[#B28930] hover:bg-[#B28930] hover:text-white"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Updated Content Section */}
                  <div className="prose prose-lg max-w-none">
                    {(() => {
                      const paragraphs = formatContent(selectedBlogPost.content);

                      if (paragraphs.length === 0) {
                        return <p className="text-gray-500 italic">No content available.</p>;
                      }

                      return paragraphs.map((paragraph, index) => (
                        <p key={index} className="text-gray-700 leading-relaxed mb-4 md:mb-6">
                          {paragraph}
                        </p>
                      ));
                    })()}
                  </div>

                  <div className="border-t border-gray-200 pt-6 mt-6 md:mt-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center space-x-4 md:space-x-6">
                        <div className="flex items-center space-x-2">
                          <Heart className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                          <span className="text-gray-600 text-sm md:text-base">
                            {selectedBlogPost.likes} likes
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                          <span className="text-gray-600 text-sm md:text-base">
                            {selectedBlogPost.comments} comments
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="border-[#B28930] text-[#B28930] hover:bg-[#B28930] hover:text-white w-full md:w-auto"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Article
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
