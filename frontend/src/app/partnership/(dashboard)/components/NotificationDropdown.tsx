// src/app/partnership/(dashboard)/components/NotificationsDropdown.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { generateNotifications, type Notification } from '../data/mockData';
import { NotificationItem } from './NotificationItem';
import { useRouter } from 'next/navigation';

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [displayedNotifications, setDisplayedNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const ITEMS_PER_PAGE = 5;

  // Load notifications
  useEffect(() => {
    const loadNotifications = () => {
      setLoading(true);
      setTimeout(() => {
        const allNotifications = generateNotifications();
        setNotifications(allNotifications);
        // Show first page
        const firstPage = allNotifications.slice(0, ITEMS_PER_PAGE);
        setDisplayedNotifications(firstPage);
        setLoading(false);
      }, 300);
    };

    loadNotifications();
  }, []);

  // Load more notifications
  const loadMoreNotifications = useCallback(() => {
    if (loadingMore) return;

    setLoadingMore(true);
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = 0;
      const endIndex = nextPage * ITEMS_PER_PAGE;
      const nextBatch = notifications.slice(startIndex, endIndex);

      setDisplayedNotifications(nextBatch);
      setCurrentPage(nextPage);
      setLoadingMore(false);
    }, 300);
  }, [currentPage, notifications, loadingMore]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset pagination when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      // Reset to first page when dropdown closes
      setTimeout(() => {
        const firstPage = notifications.slice(0, ITEMS_PER_PAGE);
        setDisplayedNotifications(firstPage);
        setCurrentPage(1);
      }, 300);
    }
  }, [isOpen, notifications]);

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    const updatedNotifications = notifications.map((n) =>
      n.id === notification.id ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);

    // Update displayed notifications to reflect read status
    const updatedDisplayed = displayedNotifications.map((n) =>
      n.id === notification.id ? { ...n, read: true } : n
    );
    setDisplayedNotifications(updatedDisplayed);

    // Navigate to action URL if available
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }

    // Close dropdown
    setIsOpen(false);
  };

  const markAllAsRead = () => {
    const allRead = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(allRead);

    const displayedRead = displayedNotifications.map((n) => ({ ...n, read: true }));
    setDisplayedNotifications(displayedRead);
  };

  // Calculate if there are more notifications to load
  const hasMoreNotifications = displayedNotifications.length < notifications.length;

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-purple-600 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50"
        >
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-purple-600 hover:text-purple-700 flex items-center"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Mark all as read
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto pr-1">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="border-l-2 border-gray-200 pl-3">
                        <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayedNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No notifications</p>
                  <p className="text-sm text-gray-400 mt-1">
                    New opportunities, drives, and updates will appear here
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {displayedNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onClick={handleNotificationClick}
                      />
                    ))}
                  </div>

                  {/* Load More Button */}
                  {hasMoreNotifications && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={loadMoreNotifications}
                        disabled={loadingMore}
                        className="w-full text-center text-sm text-purple-600 hover:text-purple-700 font-medium py-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingMore ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-600 border-t-transparent mr-2"></div>
                            Loading...
                          </>
                        ) : (
                          <>
                            View more ({notifications.length - displayedNotifications.length} more)
                            <ChevronDown className="h-4 w-4 ml-1" />
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Show total count when all loaded */}
                  {!hasMoreNotifications && notifications.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                      <p className="text-xs text-gray-500">
                        Showing all {notifications.length} notifications
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
