"use client";

import React from 'react';
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
import { AlertCircle, Info, CheckCircle, XCircle, BellOff, MailOpen, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface NotificationsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  unreadCount: number;
}

const iconMap: { [key: string]: React.ElementType } = {
  info: Info,
  warning: AlertCircle,
  critical: AlertCircle,
  success: CheckCircle,
};

const NotificationsSheet = ({ isOpen, onClose, notifications, unreadCount }: NotificationsSheetProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('user_notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      toast.error("Failed to mark notification as read.");
      console.error("Error marking notification as read:", error);
    } else {
      queryClient.invalidateQueries({ queryKey: ["userNotifications"] });
    }
  };

  const markAllAsRead = async () => {
    const { error } = await supabase
      .from('user_notifications')
      .update({ read: true })
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .eq('read', false);

    if (error) {
      toast.error("Failed to mark all notifications as read.");
      console.error("Error marking all notifications as read:", error);
    } else {
      queryClient.invalidateQueries({ queryKey: ["userNotifications"] });
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
      onClose(); // Close the sheet after navigating
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold flex items-center justify-between">
            Notifications
            {unreadCount > 0 && (
              <span className="text-sm font-medium text-muted-foreground">
                {unreadCount} unread
              </span>
            )}
          </SheetTitle>
          <SheetDescription>
            Stay updated with important events and insights.
          </SheetDescription>
        </SheetHeader>

        <div className="flex justify-end py-2">
          <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
            <MailOpen className="h-4 w-4 mr-2" /> Mark all as read
          </Button>
        </div>

        <Separator />

        <ScrollArea className="flex-grow pr-4 -mr-4">
          <div className="space-y-4 py-4">
            {notifications.length === 0 ? (
              <div className="text-center text-muted-foreground py-10">
                <BellOff className="h-10 w-10 mx-auto mb-3" />
                <p>No notifications yet.</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const IconComponent = iconMap[notification.type] || Info;
                const notificationClass = notification.read
                  ? "bg-muted/50 text-muted-foreground"
                  : "bg-card text-foreground border border-border shadow-sm hover:bg-accent/50";
                const iconColorClass = {
                  info: "text-blue-500",
                  warning: "text-yellow-500",
                  critical: "text-red-500",
                  success: "text-green-500",
                }[notification.type];

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start p-4 rounded-lg transition-colors duration-200 cursor-pointer",
                      notificationClass
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <IconComponent className={cn("h-5 w-5 mr-3 flex-shrink-0", iconColorClass)} />
                    <div className="flex-grow">
                      <p className="text-sm font-medium leading-snug">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNowStrict(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                      {notification.link && (
                        <span className="text-xs text-blue-500 dark:text-blue-400 flex items-center mt-1">
                          <ExternalLink className="h-3 w-3 mr-1" /> View Details
                        </span>
                      )}
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 ml-3 flex-shrink-0 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering parent onClick
                          markAsRead(notification.id);
                        }}
                      >
                        <MailOpen className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationsSheet;