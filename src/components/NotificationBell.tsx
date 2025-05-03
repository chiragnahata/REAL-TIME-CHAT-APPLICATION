import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import store from "@/services/inMemoryStore";

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: "message" | "system" | "friend";
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  // Load and listen for notifications
  useEffect(() => {
    if (!user) return;

    // Demo notifications
    const demoNotifications: Notification[] = [
      {
        id: "1",
        title: "New Message",
        message: "Alice sent you a message",
        timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
        read: false,
        type: "message",
      },
      {
        id: "2",
        title: "System Update",
        message: "Cosmic Chat was updated to version 1.2",
        timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
        read: true,
        type: "system",
      },
      {
        id: "3",
        title: "New Room",
        message: "You were added to 'Space Explorers' room",
        timestamp: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
        read: false,
        type: "system",
      },
    ];

    setNotifications(demoNotifications);
    updateUnreadCount(demoNotifications);

    // Listen for new messages that would create notifications
    const handleNewMessage = (message: any) => {
      if (message.recipient === user.id && !message.isRead) {
        const sender = store.getUser(message.sender);
        if (sender) {
          const newNotification: Notification = {
            id: `msg-${message.id}`,
            title: "New Message",
            message: `${sender.username} sent you a message`,
            timestamp: message.timestamp,
            read: false,
            type: "message",
          };

          setNotifications((prev) => {
            const updated = [newNotification, ...prev];
            updateUnreadCount(updated);
            return updated;
          });
        }
      }
    };

    store.on("messageAdded", handleNewMessage);

    return () => {
      store.off("messageAdded", handleNewMessage);
    };
  }, [user]);

  const updateUnreadCount = (notifs: Notification[]) => {
    setUnreadCount(notifs.filter((n) => !n.read).length);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    updateUnreadCount(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return (
          <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <svg
              className="h-4 w-4 text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
        );
      case "system":
        return (
          <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <svg
              className="h-4 w-4 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
      case "friend":
        return (
          <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg
              className="h-4 w-4 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full h-9 w-9"
        >
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1"
              >
                <Badge className="h-5 min-w-5 flex items-center justify-center p-0 bg-red-500 text-white">
                  {unreadCount}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 bg-gray-900 border-gray-700 text-white"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-blue-400 hover:text-blue-300"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex items-start p-3 gap-3 cursor-pointer ${notification.read ? "opacity-70" : ""}`}
                onClick={() => markAsRead(notification.id)}
              >
                {getNotificationIcon(notification.type)}
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <span className="text-xs text-gray-400">
                      {formatTime(notification.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">
                    {notification.message}
                  </p>
                </div>
                {!notification.read && (
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-1"></div>
                )}
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-4 text-center text-gray-400">
              No notifications
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NotificationBell;
