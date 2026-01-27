// src/app/partnership/(dashboard)/components/PostListingModal.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Store, X, Image as ImageIcon, Tag, MapPin, DollarSign, Calendar } from 'lucide-react';

export type ListingFormData = {
  id?: string;
  type: 'product' | 'service' | 'need';
  title: string;
  description: string;
  price: string;
  currency: 'UGX' | 'USD';
  category: string;
  location: string;
  contactMethod: 'message' | 'phone' | 'email' | 'whatsapp';
  tags: string;
  imageUrl?: string;
};

type PostListingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: ListingFormData) => Promise<void>;
  initialData?: ListingFormData | null;
  isEditing?: boolean;
};

export function PostListingModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
}: PostListingModalProps) {
  const [formData, setFormData] = useState<ListingFormData>({
    type: 'product',
    title: '',
    description: '',
    price: '',
    currency: 'UGX',
    category: '',
    location: '',
    contactMethod: 'whatsapp',
    tags: '',
    imageUrl: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  // Predefined categories
  const categories = [
    'Electronics',
    'Vehicles',
    'Real Estate',
    'IT & Development',
    'Finance',
    'Design & Creative',
    'Photography',
    'Home & Garden',
    'Fashion & Beauty',
    'Health & Wellness',
    'Education',
    'Other',
  ];

  // Contact methods
  const contactMethods = [
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'phone', label: 'Phone Call' },
    { value: 'email', label: 'Email' },
    { value: 'message', label: 'In-App Message' },
  ];

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        type: 'product',
        title: '',
        description: '',
        price: '',
        currency: 'UGX',
        category: '',
        location: '',
        contactMethod: 'whatsapp',
        tags: '',
        imageUrl: '',
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof ListingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      onClose();
      // Reset form
      if (!isEditing) {
        setFormData({
          type: 'product',
          title: '',
          description: '',
          price: '',
          currency: 'UGX',
          category: '',
          location: '',
          contactMethod: 'whatsapp',
          tags: '',
          imageUrl: '',
        });
        setCustomCategory('');
      }
    } catch (error) {
      console.error('Error submitting listing:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'product':
        return 'Product for Sale';
      case 'service':
        return 'Service Offered';
      case 'need':
        return 'Product/Service Needed';
      default:
        return 'Listing';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Store className="h-5 w-5 mr-2 text-purple-600" />
            {isEditing ? 'Edit Listing' : 'Post New Listing'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Listing Type */}
          <div className="space-y-2">
            <Label htmlFor="type" className="flex items-center">
              <Store className="h-4 w-4 mr-2" />
              Listing Type
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectChange('type', 'product')}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  formData.type === 'product'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">Product</div>
                <div className="text-xs text-gray-500">For Sale</div>
              </button>
              <button
                type="button"
                onClick={() => handleSelectChange('type', 'service')}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  formData.type === 'service'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">Service</div>
                <div className="text-xs text-gray-500">Offered</div>
              </button>
              <button
                type="button"
                onClick={() => handleSelectChange('type', 'need')}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  formData.type === 'need'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">Need</div>
                <div className="text-xs text-gray-500">Request</div>
              </button>
            </div>
          </div>

          {/* Title and Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., iPhone 14 Pro Max"
                required
                maxLength={60}
              />
              <p className="text-xs text-gray-500">{formData.title.length}/60 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Price
              </Label>
              <div className="flex gap-2">
                <Select
                  value={formData.currency}
                  onValueChange={(value) => handleSelectChange('currency', value)}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UGX">UGX</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="5000000"
                  required
                />
              </div>
            </div>
          </div>

          {/* Category and Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">
                    <div className="flex items-center">
                      <span>Other (specify)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {formData.category === 'custom' && (
                <Input
                  placeholder="Enter custom category"
                  value={customCategory}
                  onChange={(e) => {
                    setCustomCategory(e.target.value);
                    handleSelectChange('category', e.target.value);
                  }}
                  className="mt-2"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Location
              </Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Kampala Central"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your listing in detail..."
              rows={4}
              required
              maxLength={500}
            />
            <p className="text-xs text-gray-500">{formData.description.length}/500 characters</p>
          </div>

          {/* Tags and Contact Method */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tags" className="flex items-center">
                <Tag className="h-4 w-4 mr-2" />
                Tags (comma separated)
              </Label>
              <Input
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="iphone, smartphone, apple"
              />
              <p className="text-xs text-gray-500">Add tags to help people find your listing</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactMethod">Contact Method</Label>
              <Select
                value={formData.contactMethod}
                onValueChange={(value) => handleSelectChange('contactMethod', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contactMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Image URL (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="flex items-center">
              <ImageIcon className="h-4 w-4 mr-2" />
              Image URL (Optional)
            </Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl || ''}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-gray-500">Add a direct image link for better visibility</p>
          </div>

          {/* Preview (optional) */}
          {formData.imageUrl && (
            <div className="space-y-2">
              <Label>Image Preview</Label>
              <div className="h-40 rounded-lg overflow-hidden border">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-[#B28930] hover:from-purple-700 hover:to-[#A07828]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  {isEditing ? 'Updating...' : 'Posting...'}
                </>
              ) : (
                <>
                  <Store className="h-4 w-4 mr-2" />
                  {isEditing ? 'Update Listing' : 'Post Listing'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
