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
  Users,
  Store,
  Target,
  Trash2,
  Edit2,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { PostListingModal, type ListingFormData } from '../components/PostListingModal';
import {
  generateMarketplaceItems,
  marketplaceCategories,
  getMarketplaceTypeColor,
  getMarketplaceStatusColor,
  formatRelativeTime,
  type MarketplaceItem,
} from '../data/mockData';
import Image from 'next/image';

export default function MarketplacePage() {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingListing, setEditingListing] = useState<ListingFormData | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Load marketplace items
  useEffect(() => {
    const loadItems = () => {
      setLoading(true);
      setTimeout(() => {
        const allItems = generateMarketplaceItems();
        setItems(allItems);
        setFilteredItems(allItems);
        setLoading(false);
      }, 800);
    };

    loadItems();
  }, []);

  // Handle post listing submission
  const handlePostListing = async (formData: ListingFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (isEditing && editingListing) {
      // Update existing listing
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingListing.id
            ? {
                ...item,
                ...formData,
                price: parseInt(formData.price),
                tags: formData.tags
                  .split(',')
                  .map((tag) => tag.trim())
                  .filter((tag) => tag),
                postedDate: new Date().toISOString(),
              }
            : item
        )
      );
      alert('Listing updated successfully!');
    } else {
      // Add new listing
      const newListing: MarketplaceItem = {
        id: `item-${Date.now()}`,
        type: formData.type,
        title: formData.title,
        description: formData.description,
        price: parseInt(formData.price),
        currency: formData.currency,
        category: formData.category,
        postedBy: {
          id: 'current-user',
          name: 'You',
          avatarColor: 'from-purple-600 to-purple-400',
          community: 'working-class',
          memberSince: '2024-01-01',
        },
        postedDate: new Date().toISOString(),
        location: formData.location,
        status: 'available',
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        contactMethod: formData.contactMethod,
        imageUrl: formData.imageUrl || '',
        views: 0,
        likes: 0,
        comments: 0,
      };

      setItems((prev) => [newListing, ...prev]);
      alert('Listing posted successfully!');
    }

    setEditingListing(null);
    setIsEditing(false);
  };

  // Handle edit button click
  const handleEditClick = (item: MarketplaceItem) => {
    const formData: ListingFormData = {
      id: item.id,
      type: item.type,
      title: item.title,
      description: item.description,
      price: item.price.toString(),
      currency: item.currency,
      category: item.category,
      location: item.location,
      contactMethod: item.contactMethod,
      tags: item.tags.join(', '),
      imageUrl: item.imageUrl,
    };

    setEditingListing(formData);
    setIsEditing(true);
    setShowPostModal(true);
  };

  // Handle new listing button click
  const handleNewListingClick = () => {
    setEditingListing(null);
    setIsEditing(false);
    setShowPostModal(true);
  };

  // Handle delete listing
  const handleDeleteListing = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setItems((prev) => prev.filter((item) => item.id !== itemId));
      alert('Listing deleted successfully!');
    }
  };

  // Apply filters when search or category changes
  useEffect(() => {
    let filtered = [...items];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
          item.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (activeCategory !== 'all') {
      const category = marketplaceCategories.find((c) => c.id === activeCategory);
      if (category) {
        if (
          category.type === 'product' ||
          category.type === 'service' ||
          category.type === 'need'
        ) {
          filtered = filtered.filter((item) => item.type === category.type);
        } else {
          filtered = filtered.filter((item) => item.category === category.name);
        }
      }
    }

    setFilteredItems(filtered);
    setCurrentPage(0); // Reset to first page when filters change
  }, [searchQuery, activeCategory, items]);

  // Get current page items
  const getCurrentItems = () => {
    const startIndex = currentPage * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  };

  // Pagination handlers
  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  // Contact icon based on method
  const getContactIcon = (method: MarketplaceItem['contactMethod']) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Partner Marketplace</h1>
        </div>

        <Button
          className="bg-gradient-to-r from-purple-600 to-[#B28930] hover:from-purple-700 hover:to-[#A07828] w-full sm:w-auto"
          onClick={handleNewListingClick}
        >
          <Plus className="h-4 w-4 mr-2" />
          Post Listing
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="flex-1">
        <p className="text-gray-600">
          This marketplace is exclusively for partners to buy, sell, or request products and
          services within our community. All transactions should be conducted with integrity and in
          the spirit of partnership.
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

      {/* Search and Filters */}
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

          {/* Category Filters */}
          <div className="mt-6">
            <div className="flex items-center mb-3">
              <Tag className="h-4 w-4 text-gray-500 mr-2" />
              <h3 className="text-sm font-medium text-gray-700">Categories</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {marketplaceCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                    activeCategory === category.id
                      ? 'bg-gradient-to-r from-purple-600 to-[#B28930] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                  <span className="ml-2 text-xs opacity-80">({category.count})</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Marketplace Listings */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Latest Listings</h2>
            <p className="text-gray-600 mt-1">
              {activeCategory === 'all'
                ? 'All partner listings'
                : `${marketplaceCategories.find((c) => c.id === activeCategory)?.name} in the community`}
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Showing {getCurrentItems().length} of {filteredItems.length} listings
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader className="pb-4">
                  <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : getCurrentItems().length === 0 ? (
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
              }}
            >
              Clear filters
            </Button>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getCurrentItems().map((item) => {
                const typeColor = getMarketplaceTypeColor(item.type);
                const statusColor = getMarketplaceStatusColor(item.status);

                return (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                    {/* Remove top border indicator if you want even more compact */}

                    {/* Image - Very compact */}
                    <div className="relative h-28 overflow-hidden bg-gray-100">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <Store className="h-10 w-10 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Content - Very compact */}
                    <div className="p-3 space-y-2">
                      {/* Title only */}
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                        {item.title}
                      </h3>

                      {/* Price, Location, and Date in one line */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-baseline">
                          <span className="font-bold text-gray-900">
                            {item.currency} {item.price.toLocaleString()}
                          </span>
                          {item.type === 'service' && (
                            <span className="text-gray-500 ml-1">/proj</span>
                          )}
                        </div>
                        <div className="flex items-center text-gray-500">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="truncate max-w-[80px]">{item.location}</span>
                        </div>
                      </div>

                      {/* Description - Very short */}
                      <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>

                      {/* Posted By and Contact - Compact single line */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center min-w-0">
                          <div
                            className={`h-6 w-6 rounded-full ${item.postedBy.avatarColor} flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0`}
                          >
                            {item.postedBy.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <p className="text-xs text-gray-700 truncate max-w-[100px]">
                            {item.postedBy.name}
                          </p>
                        </div>

                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{formatRelativeTime(item.postedDate)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {/* Show edit/delete only for current user's listings */}
                          {item.postedBy.id === 'current-user' ? (
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
                            <button
                              className="p-2 text-gray-400 hover:text-blue-500 transition-colors hover:bg-blue-50 rounded-lg flex-shrink-0"
                              title={`Contact via ${item.contactMethod}`}
                            >
                              {getContactIcon(item.contactMethod)}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-500">
                    Showing {currentPage * itemsPerPage + 1} -{' '}
                    {Math.min((currentPage + 1) * itemsPerPage, filteredItems.length)} of{' '}
                    {filteredItems.length} listings
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    onClick={prevPage}
                    disabled={currentPage === 0}
                    variant="outline"
                    className="border-gray-300"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <div className="flex items-center space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => goToPage(i)}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                          currentPage === i
                            ? 'bg-gradient-to-r from-purple-600 to-[#B28930] text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <Button
                    onClick={nextPage}
                    disabled={currentPage === totalPages - 1}
                    variant="outline"
                    className="border-gray-300"
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
      />
    </div>
  );
}
