// src/app/partnership/(dashboard)/components/GoalSettingModal.tsx
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
import { Target, Calendar, DollarSign, TrendingUp, X } from 'lucide-react';

export type GoalFormData = {
  id?: number;
  name: string;
  target: string;
  current: string;
  deadline: string;
  category: 'financial' | 'engagement' | 'spiritual' | 'community';
  description: string;
};

type GoalSettingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: GoalFormData) => Promise<void>;
  initialData?: GoalFormData | null;
  isEditing?: boolean;
};

export function GoalSettingModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
}: GoalSettingModalProps) {
  const [formData, setFormData] = useState<GoalFormData>({
    name: '',
    target: '',
    current: '0',
    deadline: '',
    category: 'financial',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        target: initialData.target || '',
        current: initialData.current || '0',
        deadline: initialData.deadline || '',
        category: initialData.category || 'financial',
        description: initialData.description || '',
      });
    } else {
      // Set default deadline to 3 months from now
      const defaultDeadline = new Date();
      defaultDeadline.setMonth(defaultDeadline.getMonth() + 3);
      setFormData((prev) => ({
        ...prev,
        deadline: defaultDeadline.toISOString().split('T')[0],
      }));
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof GoalFormData, value: string) => {
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
        const defaultDeadline = new Date();
        defaultDeadline.setMonth(defaultDeadline.getMonth() + 3);
        setFormData({
          name: '',
          target: '',
          current: '0',
          deadline: defaultDeadline.toISOString().split('T')[0],
          category: 'financial',
          description: '',
        });
      }
    } catch (error) {
      console.error('Error submitting goal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial':
        return <DollarSign className="h-4 w-4" />;
      case 'engagement':
        return <TrendingUp className="h-4 w-4" />;
      case 'spiritual':
        return <Target className="h-4 w-4" />;
      case 'community':
        return <Target className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'financial':
        return 'Financial Goal';
      case 'engagement':
        return 'Engagement Goal';
      case 'spiritual':
        return 'Spiritual Goal';
      case 'community':
        return 'Community Goal';
      default:
        return 'Goal';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-purple-600" />
            {isEditing ? 'Edit Goal' : 'Set New Goal'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Goal Name
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Monthly Giving Target"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target" className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Target Amount
              </Label>
              <Input
                id="target"
                name="target"
                type="number"
                value={formData.target}
                onChange={handleChange}
                placeholder="500000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current" className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Current Progress
              </Label>
              <Input
                id="current"
                name="current"
                type="number"
                value={formData.current}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadline" className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Deadline
              </Label>
              <Input
                id="deadline"
                name="deadline"
                type="date"
                value={formData.deadline}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center">
                      {getCategoryIcon(formData.category)}
                      <span className="ml-2">{getCategoryLabel(formData.category)}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Financial Goal
                    </div>
                  </SelectItem>
                  <SelectItem value="engagement">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Engagement Goal
                    </div>
                  </SelectItem>
                  <SelectItem value="spiritual">
                    <div className="flex items-center">
                      <Target className="h-4 w-4 mr-2" />
                      Spiritual Goal
                    </div>
                  </SelectItem>
                  <SelectItem value="community">
                    <div className="flex items-center">
                      <Target className="h-4 w-4 mr-2" />
                      Community Goal
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your goal and why it's important..."
              rows={3}
            />
          </div>

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
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  {isEditing ? 'Update Goal' : 'Create Goal'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
