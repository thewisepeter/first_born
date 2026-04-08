'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, ChevronDown, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as activitiesService from '../../../../services/activities';

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<activitiesService.Activity[]>([]);
  const [displayedNotifications, setDisplayedNotifications] = useState<
    activitiesService.Activity[]
  >([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [unseenCount, setUnseenCount] = useState(0);
  const [hasSeen, setHasSeen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const ITEMS_PER_PAGE = 5;

  // Fetch notifications from API
  const fetchNotifications = useCallback(
    async (showLoading = true) => {
      if (showLoading) setLoading(true);
      try {
        const data = await activitiesService.getNotifications();
        setNotifications(data);

        // Only update unseen count if we haven't seen them yet
        if (!hasSeen) {
          setUnseenCount(data.length);
        }

        // Update displayed notifications if dropdown is open
        if (isOpen) {
          const firstPage = data.slice(0, ITEMS_PER_PAGE);
          setDisplayedNotifications(firstPage);
          setHasMore(data.length > ITEMS_PER_PAGE);
        }
        setCurrentPage(1);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [isOpen, hasSeen]
  );

  // Mark as seen when dropdown is opened
  const markAsSeen = useCallback(() => {
    if (!hasSeen) {
      setHasSeen(true);
      setUnseenCount(0);
    }
  }, [hasSeen]);

  // Start polling for new notifications
  useEffect(() => {
    // Initial fetch
    fetchNotifications(false);

    // Poll every 30 seconds for new notifications
    pollingIntervalRef.current = setInterval(() => {
      // Only poll if dropdown is not open to avoid UI flicker
      if (!isOpen) {
        fetchNotifications(false);
      }
    }, 30000); // Check every 30 seconds

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchNotifications, isOpen]);

  // Load more notifications
  const loadMoreNotifications = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const endIndex = nextPage * ITEMS_PER_PAGE;
      const nextBatch = notifications.slice(0, endIndex);

      setDisplayedNotifications(nextBatch);
      setCurrentPage(nextPage);
      setHasMore(notifications.length > endIndex);
    } catch (error) {
      console.error('Error loading more notifications:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, notifications, hasMore, loadingMore]);

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

  // Fetch fresh notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(true);
      markAsSeen(); // Mark as seen when dropdown opens
    }
  }, [isOpen, fetchNotifications, markAsSeen]);

  // Reset pagination when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setDisplayedNotifications([]);
      setCurrentPage(1);
      setHasMore(true);
    }
  }, [isOpen]);

  // Reset seen status when new notifications arrive while dropdown is closed
  useEffect(() => {
    if (!isOpen && notifications.length > 0 && hasSeen) {
      // If there are new notifications (polling detected new ones) and we've seen before
      // We need to compare with previous count. This is a simplified version.
      // For more accuracy, you'd track the last notification ID or timestamp.
      setHasSeen(false);
      setUnseenCount(notifications.length);
    }
  }, [notifications, isOpen, hasSeen]);

  const handleNotificationClick = (notification: activitiesService.Activity) => {
    // Navigate based on notification type
    if (notification.action_type) {
      const routes: Record<string, string> = {
        drive_created: '/partnership/drives',
        opportunity_created: '/partnership/opportunities',
        budget_created: '/partnership',
        marketplace_listing: '/partnership/marketplace',
        giving_received: '/partnership/giving',
        partner_joined: '/partnership',
      };

      const route = routes[notification.action_type];
      if (route) {
        router.push(route);
      }
    }

    // Close dropdown
    setIsOpen(false);
  };

  // Helper to get notification icon
  const getNotificationIcon = (notification: activitiesService.Activity): string => {
    const iconMap: Record<string, string> = {
      drive_created: '🚀',
      opportunity_created: '💼',
      budget_created: '💰',
      marketplace_listing: '🛒',
      giving_received: '🙏',
      partner_joined: '👥',
    };
    return iconMap[notification.action_type] || notification.icon || '📢';
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-purple-600 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unseenCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {unseenCount > 9 ? '9+' : unseenCount}
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Updates</h3>
            </div>

            <div className="max-h-[400px] overflow-y-auto pr-1">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayedNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No recent updates</p>
                  <p className="text-sm text-gray-400 mt-1">
                    New opportunities, drives, and updates will appear here
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {displayedNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="border-l-2 border-gray-200 pl-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-xl">{getNotificationIcon(notification)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                              {notification.description}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">{notification.time_ago}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {hasMore && displayedNotifications.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={loadMoreNotifications}
                        disabled={loadingMore}
                        className="w-full text-center text-sm text-purple-600 hover:text-purple-700 font-medium py-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingMore ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
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
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
