"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Notification } from '@/types';
import { formatDistanceToNowStrict } from 'date-fns';
import { AlertCircle, Info, CheckCircle, XCircle, BellOff, MailOpen, ExternalLink, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } => 'react-router-dom';
import { useSupabase } from '@/components/SupabaseProvider';

interface NotificationsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  // notifications and unreadCount props are no longer passed directly
}

const iconMap: { [key: string]: React.ElementType } = {
  info: Info,
  warning: AlertCircle,
  critical: AlertCircle,
  success: CheckCircle,
};

const NOTIFICATIONS_PER_PAGE = 20;

const NotificationsSheet = ({ isOpen, onClose }: NotificationsSheetProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { session } = useSupabase();
  const userId = session?.user?.id;

  const [expandedDigests, setExpandedDigests] = useState<Set<string>>(new Set());

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery<Notification[], Error>({
    queryKey: ["userNotifications", userId],
    queryFn: async ({ pageParam = 0 }) => {
      if (!userId) throw new Error("User not authenticated.");
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(pageParam * NOTIFICATIONS_PER_PAGE, (pageParam + 1) * NOTIFICATIONS_PER_PAGE - 1);

      if (error) throw error;
      return data || [];
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < NOTIFICATIONS_PER_PAGE) {
        return undefined; // No more pages
      }
      return allPages.length; // Next page index
    },
    enabled: isOpen && !!userId, // Only fetch when sheet is open and user is authenticated
    initialPageParam: 0,
  });

  const allNotifications = useMemo(() => data?.pages.flat() || [], [data]);

  // Client-side grouping for digest notifications
  const groupedNotifications = useMemo(() => {
    const groups = new Map<string, { digestKey: string; type: string; message: string; count: number; unreadCount: number; latestCreatedAt: string; link?: string; notifications: Notification[] }>();

    allNotifications.forEach(notification => {
      const key = notification.digest_key || notification.id; // Use digest_key if available, otherwise unique ID
      if (!groups.has(key)) {
        groups.set(key, {
          digestKey: key,
          type: notification.type,
          message: notification.message, // Keep original message for individual display
          count: 0,
          unreadCount: 0,
          latestCreatedAt: notification.created_at,
          link: notification.link,
          notifications: [],
        });
      }
      const group = groups.get(key)!;
      group.count++;
      if (!notification.read) {
        group.unreadCount++;
      }
      // For digest, we might want a more generic message. Let's simplify it here.
      if (notification.digest_key) {
        // Example: "Ticket XXXX stalled" -> "Tickets stalled"
        if (notification.type === 'stalledOnTech') {
          group.message = `Multiple tickets stalled for ${notification.daysStalled || ''} days`;
        } else if (notification.type === 'highVolumeCustomer') {
          group.message = `High volume customer activity for ${notification.customerName || ''}`;
        } else {
          group.message = notification.message; // Fallback to original
        }
      } else {
        group.message = notification.message;
      }
      group.notifications.push(notification);
      // Ensure latest created_at is tracked for sorting
      if (notification.created_at > group.latestCreatedAt) {
        group.latestCreatedAt = notification.created_at;
      }
    });

    // Sort groups by latest notification created_at
    return Array.from(groups.values()).sort((a, b) => b.latestCreatedAt.localeCompare(a.latestCreatedAt));
  }, [allNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    const { error } = await supabase
      .from('user_notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      toast.error("Failed to mark notification as read.");
      console.error("Error marking notification as read:", error);
    } else {
      queryClient.invalidateQueries({ queryKey: ["userNotifications", userId] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationsCount", userId] });
    }
  }, [queryClient, userId]);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    const { error } = await supabase
      .from('user_notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      toast.error("Failed to mark all notifications as read.");
      console.error("Error marking all notifications as read:", error);
    } else {
      queryClient.invalidateQueries({ queryKey: ["userNotifications", userId] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationsCount", userId] });
    }
  }, [queryClient, userId]);

  const handleNotificationClick = useCallback(async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id!);
    }
    if (notification.link) {
      navigate(notification.link);
      onClose(); // Close the sheet after navigating
    }
  }, [markAsRead, navigate, onClose]);

  const toggleDigestExpand = (digestKey: string) => {
    setExpandedDigests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(digestKey)) {
        newSet.delete(digestKey);
      } else {
        newSet.add(digestKey);
      }
      return newSet;
    });
  };

  // Refetch notifications when the sheet opens
  useEffect(() => {
    if (isOpen && userId) {
      refetch();
    }
  }, [isOpen, userId, refetch]);

  const totalUnreadCount = useMemo(() => {
    return allNotifications.filter(n => !n.read).length;
  }, [allNotifications]);

  if (isError) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold">Notifications</SheetTitle>
            <SheetDescription>
              Stay updated with important events and insights.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col items-center justify-center flex-grow text-red-500 dark:text-red-400 text-center">
            <AlertCircle className="h-10 w-10 mb-3" />
            <p className="font-medium">Error loading notifications:</p>
            <p className="text-sm">{error?.message}</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold flex items-center justify-between">
            Notifications
            {totalUnreadCount > 0 && (
              <span className="text-sm font-medium text-muted-foreground">
                {totalUnreadCount} unread
              </span>
            )}
          </SheetTitle>
          <SheetDescription>
            Stay updated with important events and insights.
          </SheetDescription>
        </SheetHeader>

        <div className="flex justify-end py-2">
          <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={totalUnreadCount === 0 || isLoading}>
            <MailOpen className="h-4 w-4 mr-2" /> Mark all as read
          </Button>
        </div>

        <Separator />

        <ScrollArea className="flex-grow pr-4 -mr-4">
          <div className="space-y-4 py-4">
            {isLoading && allNotifications.length === 0 ? (
              <div className="text-center text-muted-foreground py-10">
                <Loader2 className="h-10 w-10 mx-auto mb-3 animate-spin" />
                <p>Loading notifications...</p>
              </div>
            ) : groupedNotifications.length === 0 ? (
              <div className="text-center text-muted-foreground py-10">
                <BellOff className="h-10 w-10 mx-auto mb-3" />
                <p>No notifications yet.</p>
              </div>
            ) : (
              groupedNotifications.map((group) => {
                const IconComponent = iconMap[group.type] || Info;
                const isExpanded = expandedDigests.has(group.digestKey);
                const groupHasUnread = group.notifications.some(n => !n.read);

                const groupClass = groupHasUnread
                  ? "bg-card text-foreground border border-border shadow-sm hover:bg-accent/50"
                  : "bg-muted/50 text-muted-foreground";
                const iconColorClass = {
                  info: "text-blue-500",
                  warning: "text-yellow-500",
                  critical: "text-red-500",
                  success: "text-green-500",
                }[group.type];

                return (
                  <div key={group.digestKey} className="flex flex-col">
                    <div
                      className={cn(
                        "flex items-start p-4 rounded-lg transition-colors duration-200 cursor-pointer",
                        groupClass,
                        isExpanded ? "rounded-b-none border-b-0" : ""
                      )}
                      onClick={() => group.count > 1 && toggleDigestExpand(group.digestKey)}
                    >
                      <IconComponent className={cn("h-5 w-5 mr-3 flex-shrink-0", iconColorClass)} />
                      <div className="flex-grow">
                        <p className="text-sm font-medium leading-snug">
                          {group.count > 1 ? `${group.count} ${group.message}` : group.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNowStrict(new Date(group.latestCreatedAt), { addSuffix: true })}
                        </p>
                        {group.link && group.count === 1 && ( // Only show link for single notifications
                          <span className="text-xs text-blue-500 dark:text-blue-400 flex items-center mt-1">
                            <ExternalLink className="h-3 w-3 mr-1" /> View Details
                          </span>
                        )}
                      </div>
                      {group.count > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 ml-3 flex-shrink-0 text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDigestExpand(group.digestKey);
                          }}
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      )}
                      {group.count === 1 && groupHasUnread && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 ml-3 flex-shrink-0 text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(group.notifications[0].id!);
                          }}
                        >
                          <MailOpen className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {isExpanded && group.count > 1 && (
                      <div className="border-t-0 border border-border rounded-b-lg bg-background/80 dark:bg-gray-800/80 p-2 space-y-1">
                        {group.notifications.map(notification => (
                          <div
                            key={notification.id}
                            className={cn(
                              "flex items-start p-2 rounded-md transition-colors duration-150",
                              notification.read ? "bg-muted/30 text-muted-foreground" : "bg-card hover:bg-accent/50"
                            )}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <IconComponent className={cn("h-4 w-4 mr-2 flex-shrink-0", iconColorClass)} />
                            <div className="flex-grow">
                              <p className="text-xs leading-snug">{notification.message}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {formatDistanceToNowStrict(new Date(notification.created_at), { addSuffix: true })}
                              </p>
                            </div>
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 ml-2 flex-shrink-0 text-muted-foreground hover:text-foreground"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id!);
                                }}
                              >
                                <MailOpen className="h-3 w-3" />
                              </Button>
                            )}
                            {notification.link && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 ml-1 flex-shrink-0 text-blue-500 dark:text-blue-400 hover:text-blue-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(notification.link!);
                                  onClose();
                                }}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            {hasNextPage && (
              <div className="flex justify-center mt-4">
                <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage || isLoading}>
                  {isFetchingNextPage ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 mr-2" />
                  )}
                  {isFetchingNextPage ? "Loading more..." : "Load More"}
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationsSheet;