import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckIcon, CheckCheckIcon } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  status: "sent" | "delivered" | "read";
}

interface MessageListProps {
  messages?: Message[];
  currentUserId?: string;
  isTyping?: { userId: string; name: string }[];
}

const MessageList = ({
  messages = [
    {
      id: "1",
      content: "Welcome to the chat! How is everyone doing today?",
      sender: {
        id: "user1",
        name: "Alex Chen",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      },
      timestamp: new Date(Date.now() - 3600000),
      status: "read" as const,
    },
    {
      id: "2",
      content: "I'm doing great! Just finished working on that new project.",
      sender: {
        id: "user2",
        name: "Taylor Kim",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor",
      },
      timestamp: new Date(Date.now() - 2400000),
      status: "read" as const,
    },
    {
      id: "3",
      content: "Has anyone checked out the latest updates to the system?",
      sender: {
        id: "currentUser",
        name: "You",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
      },
      timestamp: new Date(Date.now() - 1200000),
      status: "delivered" as const,
    },
  ],
  currentUserId = "currentUser",
  isTyping = [],
}: MessageListProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  // Auto-scroll to the latest message when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current && !hasScrolledToBottom) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
        setHasScrolledToBottom(true);
      }
    }
  }, [messages, hasScrolledToBottom]);

  // Reset scroll state when new messages come in
  useEffect(() => {
    setHasScrolledToBottom(false);
  }, [messages.length]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getStatusIcon = (status: Message["status"]) => {
    switch (status) {
      case "sent":
        return <CheckIcon className="h-3 w-3 text-gray-400" />;
      case "delivered":
        return <CheckIcon className="h-3 w-3 text-blue-400" />;
      case "read":
        return <CheckCheckIcon className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce<{
    [date: string]: Message[];
  }>((groups, message) => {
    const date = message.timestamp.toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  // Check if message is from the same sender as the previous one
  const isConsecutive = (message: Message, index: number, arr: Message[]) => {
    if (index === 0) return false;
    return message.sender.id === arr[index - 1].sender.id;
  };

  return (
    <div className="flex flex-col h-full w-full">
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-6">
          {Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date} className="space-y-4">
              <div className="flex justify-center">
                <Badge
                  variant="outline"
                  className="bg-gray-800/50 text-gray-400 border-gray-700"
                >
                  {new Date(date).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </Badge>
              </div>

              <AnimatePresence initial={false}>
                {dateMessages.map((message, index, arr) => {
                  const isCurrentUser = message.sender.id === currentUserId;
                  const consecutive = isConsecutive(message, index, arr);

                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} ${consecutive ? "mt-1" : "mt-4"}`}
                    >
                      <div
                        className={`flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} max-w-[80%] items-end gap-2`}
                      >
                        {!isCurrentUser && !consecutive && (
                          <Avatar className="h-8 w-8 border border-primary/10">
                            <AvatarImage
                              src={message.sender.avatar}
                              alt={message.sender.name}
                            />
                            <AvatarFallback>
                              {message.sender.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        {!isCurrentUser && consecutive && (
                          <div className="w-8" />
                        )}
                        <div
                          className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}
                        >
                          {!isCurrentUser && !consecutive && (
                            <span className="text-xs text-gray-400 mb-1">
                              {message.sender.name}
                            </span>
                          )}
                          <div
                            className={`rounded-2xl px-4 py-2 backdrop-blur-sm ${
                              isCurrentUser
                                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none"
                                : "bg-gray-700/80 text-gray-100 rounded-bl-none"
                            } ${consecutive && isCurrentUser ? "rounded-tr-md" : ""} ${consecutive && !isCurrentUser ? "rounded-tl-md" : ""}`}
                          >
                            <p className="text-sm whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </div>
                          <div
                            className={`flex items-center mt-1 text-xs text-gray-400 ${isCurrentUser ? "flex-row" : "flex-row-reverse"}`}
                          >
                            <span>{formatTime(message.timestamp)}</span>
                            {isCurrentUser && (
                              <span className="ml-1">
                                {getStatusIcon(message.status)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ))}

          {/* Typing indicators */}
          <AnimatePresence>
            {isTyping.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center space-x-2 mt-2"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${isTyping[0].name}`}
                  />
                  <AvatarFallback>{isTyping[0].name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="bg-gray-700/60 backdrop-blur-sm rounded-full px-3 py-1">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-300">
                      {isTyping.length === 1
                        ? `${isTyping[0].name} is typing`
                        : `${isTyping.length} people are typing`}
                    </span>
                    <div className="flex space-x-1">
                      <motion.div
                        animate={{
                          opacity: [0.4, 1, 0.4],
                          y: [0, -3, 0],
                        }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-1 h-1 bg-gray-300 rounded-full"
                      />
                      <motion.div
                        animate={{
                          opacity: [0.4, 1, 0.4],
                          y: [0, -3, 0],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: 0.2,
                        }}
                        className="w-1 h-1 bg-gray-300 rounded-full"
                      />
                      <motion.div
                        animate={{
                          opacity: [0.4, 1, 0.4],
                          y: [0, -3, 0],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: 0.4,
                        }}
                        className="w-1 h-1 bg-gray-300 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
};

export { MessageList };
export default MessageList;
