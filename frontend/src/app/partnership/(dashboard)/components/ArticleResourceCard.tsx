// src/app/partnership/(dashboard)/components/ArticleResourceCard.tsx
'use client';

import {
  FileText,
  ChevronLeft,
  ChevronRight,
  Tag,
  MessageCircle,
  Calendar,
  User,
  Clock,
  X,
  ArrowLeft,
} from 'lucide-react';
import { ArticleResource } from '../data/mockData';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent } from '../../../components/ui/dialog';
import { useState, useRef } from 'react';

interface ArticleResourceCardProps {
  title: string;
  description?: string;
  articles: ArticleResource[];
}

export function ArticleResourceCard({ title, description, articles }: ArticleResourceCardProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedArticle, setSelectedArticle] = useState<ArticleResource | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const articlesPerPage = 2;
  const totalPages = Math.ceil(articles.length / articlesPerPage);
  const contentRef = useRef<HTMLDivElement>(null);

  const getCurrentArticles = () => {
    const startIndex = currentPage * articlesPerPage;
    return articles.slice(startIndex, startIndex + articlesPerPage);
  };

  const nextPage = () => currentPage < totalPages - 1 && setCurrentPage((prev) => prev + 1);
  const prevPage = () => currentPage > 0 && setCurrentPage((prev) => prev - 1);
  const goToPage = (page: number) => setCurrentPage(page);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleRead = (article: ArticleResource) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  };

  // Helper function to format content into paragraphs
  const formatContent = (content: string | string[] | undefined): string[] => {
    if (!content) return ['Content not available'];

    if (Array.isArray(content)) {
      return content.filter((paragraph) => paragraph.trim().length > 0);
    }

    if (typeof content === 'string') {
      const doubleNewlineSplit = content.split(/\n\s*\n/);
      if (
        doubleNewlineSplit.length > 1 ||
        (doubleNewlineSplit.length === 1 && doubleNewlineSplit[0] !== content)
      ) {
        return doubleNewlineSplit.filter((p) => p.trim().length > 0);
      }

      const singleNewlineSplit = content.split('\n');
      if (singleNewlineSplit.length > 1) {
        return singleNewlineSplit.filter((p) => p.trim().length > 0);
      }

      return content.trim() ? [content] : [];
    }

    return ['Content not available'];
  };

  return (
    <>
      <div className="border rounded-xl p-6 hover:shadow-md transition-all duration-300 bg-white">
        {/* Section Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-100">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
          {description && <p className="text-gray-600">{description}</p>}
        </div>

        {/* Two Articles Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {getCurrentArticles().map((article) => (
            <div
              key={`${article.id}-${currentPage}`}
              className="border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              {/* Article Visual Representation */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 flex flex-col items-center justify-center aspect-[4/3] relative">
                <FileText className="h-16 w-16 text-green-500 mb-4" />
                <div className="text-center">
                  <div className="w-20 h-1 bg-green-300 rounded-full mb-2 mx-auto"></div>
                  <div className="w-16 h-1 bg-green-300 rounded-full mb-2 mx-auto"></div>
                  <div className="w-24 h-1 bg-green-300 rounded-full mx-auto"></div>
                </div>
                <div className="absolute top-4 right-4 bg-green-600 text-white text-xs px-2 py-1 rounded">
                  {article.readTime || '5 min read'}
                </div>
              </div>

              {/* Article Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant="outline"
                    className="text-xs bg-green-100 text-green-800 border-green-200"
                  >
                    {article.category.replace('-', ' ')}
                  </Badge>
                  <span className="text-xs text-gray-500">{formatDate(article.publishDate)}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {article.excerpt || article.description}
                </p>

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {article.tags.slice(0, 3).map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs text-gray-500 border-gray-200"
                      >
                        <Tag className="h-2 w-2 mr-1" /> {tag}
                      </Badge>
                    ))}
                    {article.tags.length > 3 && (
                      <span className="text-xs text-gray-400">+{article.tags.length - 3} more</span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-gray-500">By {article.author}</span>
                    {article.comments && (
                      <span className="text-xs text-gray-500 flex items-center">
                        <MessageCircle className="h-3 w-3 mr-1" /> {article.comments}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white text-xs"
                    onClick={() => handleRead(article)}
                  >
                    <FileText className="h-3 w-3 mr-1" /> Read
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-100 pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-500">
                Showing {currentPage * articlesPerPage + 1} -{' '}
                {Math.min((currentPage + 1) * articlesPerPage, articles.length)} of{' '}
                {articles.length} articles
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={prevPage} disabled={currentPage === 0}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => goToPage(i)}
                      className={`w-8 h-8 rounded text-sm ${currentPage === i ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextPage}
                  disabled={currentPage === totalPages - 1}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Article Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="!fixed !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2 
                                 !w-[95vw] !max-w-7xl !h-[90vh] !max-h-[800px] !rounded-xl 
                                 !border !border-gray-200 !shadow-2xl !p-0 !overflow-hidden"
        >
          {selectedArticle && (
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
                        <span>{formatDate(selectedArticle.publishDate)}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Reading Time</h4>
                      <div className="flex items-center text-gray-700">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{selectedArticle.readTime || '5 min read'}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Category</h4>
                      <Badge className="bg-green-600 text-white">
                        {selectedArticle.category.replace('-', ' ')}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedArticle.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700"
                          >
                            {tag}
                          </span>
                        )) || 'No tags'}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Stats</h4>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-700">
                          <span className="mr-2">👁️</span>
                          <span>{selectedArticle.views?.toLocaleString() || '0'} views</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <span className="mr-2">❤️</span>
                          <span>{selectedArticle.likes?.toLocaleString() || '0'} likes</span>
                        </div>
                        {selectedArticle.comments && (
                          <div className="flex items-center text-gray-700">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            <span>{selectedArticle.comments} comments</span>
                          </div>
                        )}
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
                      className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white text-xs px-3 transition-all duration-200"
                    >
                      All Articles
                    </Button>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col min-h-0">
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
                  {/* Hero Image (if available) */}
                  {selectedArticle.image && (
                    <div className="relative h-64 md:h-72 bg-gradient-to-br from-green-50 to-green-100">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FileText className="h-32 w-32 text-green-300" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                    </div>
                  )}

                  {/* Article Content */}
                  <div className="max-w-3xl mx-auto px-6 md:px-8 py-8">
                    <Badge className="mb-4 bg-green-600 text-white">
                      {selectedArticle.category.replace('-', ' ')}
                    </Badge>

                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                      {selectedArticle.title}
                    </h1>

                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-8">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        <span>{selectedArticle.author}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{formatDate(selectedArticle.publishDate)}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{selectedArticle.readTime || '5 min read'}</span>
                      </div>
                    </div>

                    {/* Excerpt */}
                    {selectedArticle.excerpt && (
                      <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-8 rounded-r">
                        <p className="text-green-800 font-medium italic">
                          {selectedArticle.excerpt}
                        </p>
                      </div>
                    )}

                    {/* Main Content */}
                    <article className="prose prose-lg max-w-none">
                      <div className="text-gray-700 leading-relaxed space-y-6">
                        {(() => {
                          const paragraphs = formatContent(
                            selectedArticle.content || selectedArticle.description
                          );
                          return paragraphs.map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                          ));
                        })()}
                      </div>
                    </article>

                    {/* Tags at bottom */}
                    {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                      <div className="mt-12 pt-8 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-500 mb-3">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedArticle.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-gray-600 border-gray-300"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Back to top button */}
                    <div className="mt-12 pt-8 border-t border-gray-200">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          if (contentRef.current) {
                            contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                        className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white text-xs px-3 transition-all duration-200"
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
    </>
  );
}
