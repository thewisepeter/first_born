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
import { Store, X, Tag, MapPin, DollarSign, Phone } from 'lucide-react';
import { ListingPhotos, type Photo } from './ListingPhotos';
import { MarketplaceCategory, type ListingFormData } from '../../../../services/marketplace';

export type { ListingFormData } from '../../../../services/marketplace';

type PostListingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: ListingFormData) => Promise<void>;
  initialData?: ListingFormData | null;
  isEditing?: boolean;
  categories?: MarketplaceCategory[]; // Add this prop
};

export function PostListingModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
  categories = [], // Default to empty array
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

    contactInfo: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [error, setError] = useState('');

  // Contact methods - keep these as they are
  const contactMethods = [
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'phone', label: 'Phone Call' },
    { value: 'email', label: 'Email' },
    { value: 'message', label: 'In-App Message' },
  ];

  useEffect(() => {
    setPhotos((initialData?.existingImages || []).map((saved) => ({ saved })));
    setError('');
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

        contactInfo: '',
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof ListingFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'type' && prev.type !== value ? { category: '' } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      setError('');
      await onSubmit({
        ...formData,
        newImages: photos.flatMap((p) => ('file' in p ? [p.file] : [])),
        removeImageIds: (initialData?.existingImages || [])
          .filter((image) => !photos.some((p) => 'saved' in p && p.saved.id === image.id))
          .map((image) => image.id),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter categories by listing type
  const filteredCategories = categories.filter((cat) => cat.category_type === formData.type);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
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
                  onValueChange={(value) =>
                    handleSelectChange('currency', value as 'UGX' | 'USD' | 'KES' | 'TZS')
                  }
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UGX">UGX</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="KES">KES</SelectItem>
                    <SelectItem value="TZS">TZS</SelectItem>
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
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="placeholder" disabled>
                      No categories available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
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
                onValueChange={(value) => handleSelectChange('contactMethod', value as any)}
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

          {/* Contact Info - New required field */}
          <div className="space-y-2">
            <Label htmlFor="contactInfo" className="flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              Contact Info
            </Label>
            <Input
              id="contactInfo"
              name="contactInfo"
              value={formData.contactInfo || ''}
              onChange={handleChange}
              placeholder="e.g., 0777123456 or email@example.com"
              required={formData.contactMethod !== 'message'}
            />
            <p className="text-xs text-gray-500">
              {formData.contactMethod === 'whatsapp' &&
                'Enter your WhatsApp number with country code'}
              {formData.contactMethod === 'phone' && 'Enter your phone number with country code'}
              {formData.contactMethod === 'email' && 'Enter your email address'}
              {formData.contactMethod === 'message' &&
                'Contact info is optional for in-app messages'}
            </p>
          </div>

          <ListingPhotos photos={photos} onChange={setPhotos} disabled={isSubmitting} />
          {!photos.length && initialData?.legacyImage && (
            <div className="text-xs text-gray-600">
              <img
                src={initialData.legacyImage}
                alt="Existing legacy cover"
                className="h-20 rounded"
              />
              Existing cover · used when the gallery is empty
            </div>
          )}
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            >
              <p className="font-semibold">Couldn’t save your listing</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 break-words">
                {error.split('\n').map((message, i) => (
                  <li key={i}>{message}</li>
                ))}
              </ul>
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
