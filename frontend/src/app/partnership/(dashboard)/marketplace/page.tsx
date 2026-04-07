// src/app/partnership/(dashboard)/marketplace/page.tsx

'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  MapPin,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  Phone,
  Mail,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Tag,
  Store,
  Trash2,
  Edit2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { PostListingModal, type ListingFormData } from '../components/PostListingModal';
import { useMarketplace } from '../../../../hooks/useMarketplace';
import { useAuth } from '../../../../contexts/AuthContext';
import * as marketplaceService from '../../../../services/marketplace';

// ========== STYLING HELPERS (from File 1) ==========
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Color functions from File 1
const getMarketplaceTypeColor = (type: string): string => {
  const colors = {
    product: 'bg-blue-100 text-blue-700',
    service: 'bg-green-100 text-green-700',
    need: 'bg-orange-100 text-orange-700',
  };
  return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700';
};

const getMarketplaceStatusColor = (status: string): string => {
  const colors = {
    available: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    sold: 'bg-gray-100 text-gray-700',
    expired: 'bg-red-100 text-red-700',
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
};

// Contact icon from File 1
const getContactIcon = (method: string) => {
  switch (method) {
    case 'phone':
      return <Phone className="h-4 w-4" />;
    case 'email':
      return <Mail className="h-4 w-4" />;
    case 'whatsapp':
      return <MessageSquare className="h-4 w-4" />;
    default:
      return <MessageCircle className="h-4 w-4" />;
  }
};

// ========== FUNCTIONALITY HELPERS (from File 2) ==========
const formatCurrency = (amount: number, currency: string = 'UGX'): string => {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const safeCurrency = (currency: string): 'UGX' | 'USD' | 'KES' | 'TZS' => {
  const validCurrencies = ['UGX', 'USD', 'KES', 'TZS'];
  return validCurrencies.includes(currency) ? (currency as any) : 'UGX';
};

const safeContactMethod = (method: string): 'whatsapp' | 'phone' | 'email' | 'in_app' => {
  const validMethods = ['whatsapp', 'phone', 'email', 'in_app'];
  return validMethods.includes(method) ? (method as any) : 'whatsapp';
};

export default function MarketplacePage() {
  const { user } = useAuth();
  const {
    loading,
    error,
    listings,
    categories,
    stats,
    paginatedData,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    updateFilters,
    refresh,
  } = useMarketplace(6); // 6 items per page to match File 1's 2-column grid

  // UI State (from File 1)
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
  const [activeType, setActiveType] = useState<string | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingListing, setEditingListing] = useState<ListingFormData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [likingId, setLikingId] = useState<number | null>(null);

  // Transform categories for the category buttons (from File 1 style)
  const displayCategories = [
    { id: 'all', name: 'All', count: paginatedData?.count || 0 },
    ...categories.map((cat) => ({
      id: cat.id.toString(),
      name: cat.name,
      count: stats?.by_category[cat.name] || 0,
    })),
  ];

  // Apply filters (from File 2)
  useEffect(() => {
    const filters: any = {};

    if (searchQuery) {
      filters.search = searchQuery;
    }

    if (activeCategory !== 'all') {
      filters.category = activeCategory;
    }

    if (activeType !== 'all') {
      filters.type = activeType;
    }

    updateFilters(filters);
  }, [searchQuery, activeCategory, activeType]);

  // ========== FUNCTIONALITY HANDLERS (from File 2) ==========
  const handleLike = async (id: number) => {
    try {
      setLikingId(id);
      await marketplaceService.toggleLike(id);
      refresh();
    } catch (err) {
      console.error('Error toggling like:', err);
    } finally {
      setLikingId(null);
    }
  };

  const handleSave = async (id: number) => {
    try {
      await marketplaceService.toggleSave(id);
      refresh();
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  };

  const handlePostListing = async (formData: ListingFormData) => {
    try {
      if (isEditing && editingListing?.id) {
        await marketplaceService.updateListing(parseInt(editingListing.id as string), {
          title: formData.title,
          description: formData.description,
          listing_type: formData.type,
          category: parseInt(formData.category),
          price: parseFloat(formData.price),
          currency: formData.currency,
          location: formData.location,
          contact_method: formData.contactMethod,
          tags: formData.tags
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t),
        });
      } else {
        await marketplaceService.createListing({
          title: formData.title,
          description: formData.description,
          listing_type: formData.type,
          category: parseInt(formData.category),
          price: parseFloat(formData.price),
          currency: formData.currency,
          location: formData.location,
          contact_method: formData.contactMethod,
          tags: formData.tags
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t),
        });
      }

      refresh();
      setShowPostModal(false);
      setEditingListing(null);
      setIsEditing(false);
    } catch (err) {
      console.error('Error posting listing:', err);
      alert(err instanceof Error ? err.message : 'Failed to post listing');
    }
  };

  const handleEditClick = (item: marketplaceService.MarketplaceListing) => {
    const category = categories.find((c) => c.name === item.category_name);

    const formData: ListingFormData = {
      id: item.id.toString(),
      type: item.listing_type,
      title: item.title,
      description: item.description,
      price: item.price.toString(),
      currency: safeCurrency(item.currency),
      category: category?.id.toString() || '',
      location: item.location,
      contactMethod: safeContactMethod(item.contact_method),
      tags: item.tags.join(', '),
      imageUrl: item.image_url,
    };

    setEditingListing(formData);
    setIsEditing(true);
    setShowPostModal(true);
  };

  const handleDeleteListing = async (id: number) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      try {
        await marketplaceService.deleteListing(id);
        refresh();
      } catch (err) {
        console.error('Error deleting listing:', err);
        alert('Failed to delete listing');
      }
    }
  };

  // ========== LOADING & ERROR STATES ==========
  if (loading && !listings.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading marketplace...</p>
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
            <h3 className="font-semibold text-red-800">Unable to Load Marketplace</h3>
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

  // ========== RENDER (File 1 styling + File 2 data) ==========
  return (
    <div className="space-y-6">
      {/* Header - File 1 style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Partner Marketplace</h1>
        </div>

        <Button
          variant="outline"
          className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8 py-3 rounded-lg"
          onClick={() => {
            setEditingListing(null);
            setIsEditing(false);
            setShowPostModal(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Post Listing
        </Button>
      </div>

      {/* Guidelines - File 1 style */}
      <div className="flex-1">
        <p className="text-gray-600">
          This marketplace is exclusively for partners to buy, sell, or request products and
          services within our community.
        </p>

        <p className="text-gray-600">
          All transactions should be conducted with integrity and in the spirit of partnership.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-gray-600">
          <li className="flex items-center">
            <div className="h-2 w-2 bg-green-500 rounded-full mr-2" />
            Only partners can post and interact with listings
          </li>
          <li className="flex items-center">
            <div className="h-2 w-2 bg-green-500 rounded-full mr-2" />
            All listings should be honest and accurately described
          </li>
          <li className="flex items-center">
            <div className="h-2 w-2 bg-green-500 rounded-full mr-2" />
            Treat fellow partners with respect in all communications
          </li>
          <li className="flex items-center">
            <div className="h-2 w-2 bg-green-500 rounded-full mr-2" />
            Report any suspicious activity to administrators
          </li>
        </ul>
      </div>

      {/* Search and Filters - File 1 style with File 2 data */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search marketplace (products, services, needs)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2"
              />
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:w-auto"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          {/* Category Filters - File 1 style with real data */}
          <div className="mt-6">
            <div className="flex items-center mb-3">
              <Tag className="h-4 w-4 text-gray-500 mr-2" />
              <h3 className="text-sm font-medium text-gray-700">Categories</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {displayCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id as any)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                    activeCategory === category.id
                      ? ' bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                  <span className="ml-2 text-xs opacity-80">({category.count})</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Listings Grid - File 1 compact style with File 2 data */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Latest Listings</h2>
            <p className="text-gray-600 mt-1">
              {activeCategory === 'all'
                ? 'All partner listings'
                : `${categories.find((c) => c.id === activeCategory)?.name || ''} in the community`}
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Showing {listings.length} of {paginatedData?.count || 0} listings
          </div>
        </div>

        {listings.length === 0 ? (
          <Card className="text-center py-12">
            <Store className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No listings found</h3>
            <p className="text-gray-500 mt-1 mb-4">
              {searchQuery ? 'Try a different search term' : 'No listings match your filters'}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
                setActiveType('all');
              }}
            >
              Clear filters
            </Button>
          </Card>
        ) : (
          <>
            {/* 2-column grid - File 1 style */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {listings.map((item) => {
                const typeColor = getMarketplaceTypeColor(item.listing_type);
                const isOwner = item.partner_name === `${user?.firstName} ${user?.lastName}`;

                return (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                    {/* Image - Compact height from File 1 */}
                    <div className="relative h-28 overflow-hidden bg-gray-100">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <Store className="h-10 w-10 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Content - Compact spacing from File 1 */}
                    <div className="p-3 space-y-2">
                      {/* Title */}
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                        {item.title}
                      </h3>

                      {/* Price and Location - One line from File 1 */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-baseline">
                          <span className="font-bold text-gray-900">
                            {formatCurrency(parseFloat(item.price), item.currency)}
                          </span>
                          {item.listing_type === 'service' && (
                            <span className="text-gray-500 ml-1">/proj</span>
                          )}
                        </div>
                        <div className="flex items-center text-gray-500">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="truncate max-w-[80px]">{item.location}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>

                      {/* Posted By and Contact - Compact single line from File 1 */}
                      <div className=" items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center min-w-0">
                          <div className="h-6 w-6 rounded-full bg-gradient-to-r from-purple-600 to-purple-400 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0">
                            {item.partner_name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <p className="text-xs text-gray-700 truncate max-w-[100px]">
                            {item.partner_name}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{formatRelativeTime(item.posted_date)}</span>
                          </div>

                          <div className="items-center space-x-1">
                            {isOwner ? (
                              <>
                                <button
                                  onClick={() => handleEditClick(item)}
                                  className="p-1 text-gray-400 hover:text-blue-500 transition-colors rounded hover:bg-blue-50"
                                  title="Edit"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteListing(item.id)}
                                  className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded hover:bg-red-50"
                                  title="Delete"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </>
                            ) : (
                              <a
                                href={
                                  item.contact_method === 'whatsapp'
                                    ? `https://wa.me/${item.contact_info.replace(/[^0-9]/g, '')}`
                                    : item.contact_method === 'phone'
                                      ? `tel:${item.contact_info}`
                                      : item.contact_method === 'email'
                                        ? `mailto:${item.contact_info}`
                                        : '#'
                                }
                                target={item.contact_method === 'whatsapp' ? '_blank' : '_self'}
                                rel="noopener noreferrer"
                                className="p-2 text-gray-400 hover:text-blue-500 transition-colors hover:bg-blue-50 rounded-lg flex-shrink-0"
                                title={`Contact via ${item.contact_method}`}
                              >
                                {getContactIcon(item.contact_method)}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Pagination - File 1 style with File 2 logic */}
            {totalPages > 1 && (
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * 6 + 1} -{' '}
                    {Math.min(currentPage * 6, paginatedData?.count || 0)} of {paginatedData?.count}{' '}
                    listings
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    onClick={prevPage}
                    disabled={!paginatedData?.previous}
                    variant="outline"
                    className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <div className="flex items-center space-x-2">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={i}
                          onClick={() => goToPage(pageNum)}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-gradient-to-r from-purple-600 to-[#B28930] text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    onClick={nextPage}
                    disabled={!paginatedData?.next}
                    variant="outline"
                    className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Post Listing Modal */}
      <PostListingModal
        isOpen={showPostModal}
        onClose={() => {
          setShowPostModal(false);
          setEditingListing(null);
          setIsEditing(false);
        }}
        onSubmit={handlePostListing}
        initialData={editingListing}
        isEditing={isEditing}
        categories={categories}
      />
    </div>
  );
}
