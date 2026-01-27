'use client';

import { useState, useEffect, useRef } from 'react';
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
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components//ui/button';
import { Badge } from '../components//ui/badge';
import { Dialog, DialogContent, DialogHeader } from '../components//ui/dialog';
import { ImageWithFallback } from '../components//figma/ImageWithFallback';

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

export default function Blog() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  const postsPerPage = 3;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('https://prophetnamara.org/api/blog/blogposts/');
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
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
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
                        ? 'bg-purple-600 border-purple-600 text-white hover:bg-purple-700'
                        : 'border-gray-300 text-purple-600 hover:border-purple-600 hover:text-purple-600 hover:bg-purple-50'
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
        <DialogContent
          className="!fixed !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2 
                           !w-[95vw] !max-w-7xl !h-[90vh] !max-h-[800px] !rounded-xl 
                           !border !border-gray-200 !shadow-2xl !p-0 !overflow-hidden"
        >
          {selectedBlogPost && (
            <div className="flex h-full min-h-0">
              {/* Fixed Sidebar */}
              <div className="hidden lg:flex w-80 flex-shrink-0 flex-col border-r border-gray-200 bg-gray-50">
                <div className="p-6 overflow-y-auto flex-1">
                  {/* Article Meta */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Published</h4>
                      <div className="flex items-center text-gray-700">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{selectedBlogPost.date}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Reading Time</h4>
                      <div className="flex items-center text-gray-700">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{selectedBlogPost.readTime}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Category</h4>
                      <Badge className="bg-purple-600 text-white">
                        {selectedBlogPost.category}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedBlogPost.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Back to all articles */}
                <div className="p-6 border-t border-gray-200 flex-shrink-0">
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCloseModal}
                      className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white text-xs px-3 transition-all duration-200"
                    >
                      All Articles
                    </Button>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col min-h-0">
                {' '}
                {/* Important: min-h-0 allows flex child to shrink */}
                {/* Mobile Header */}
                <div className="lg:hidden flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                  <Button variant="ghost" onClick={handleCloseModal} className="flex items-center">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCloseModal}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                {/* Scrollable Content Container */}
                <div className="flex-1 overflow-y-auto" ref={contentRef}>
                  {' '}
                  {/* This is the scrollable area */}
                  {/* Hero Image */}
                  <div className="relative h-64 md:h-72">
                    <ImageWithFallback
                      src={selectedBlogPost.image}
                      alt={selectedBlogPost.title}
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                  {/* Article Content */}
                  <div className="max-w-3xl mx-auto px-6 md:px-8 py-8">
                    <Badge className="mb-4 bg-purple-600 text-white">
                      {selectedBlogPost.category}
                    </Badge>

                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                      {selectedBlogPost.title}
                    </h1>

                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-8">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        <span>{selectedBlogPost.author}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{selectedBlogPost.date}</span>
                      </div>
                    </div>

                    <article className="prose prose-lg max-w-none">
                      <div className="text-gray-700 leading-relaxed space-y-6">
                        {(() => {
                          const paragraphs = formatContent(selectedBlogPost.content);
                          if (paragraphs.length === 0) {
                            return <p className="text-gray-500 italic">No content available.</p>;
                          }
                          return paragraphs.map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                          ));
                        })()}
                      </div>
                    </article>

                    {/* Back to top button */}
                    <div className="mt-12 pt-8 border-t border-gray-200">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          if (contentRef.current) {
                            contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                        className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white text-xs px-3 transition-all duration-200"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2 rotate-90" />
                        Back to top
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
