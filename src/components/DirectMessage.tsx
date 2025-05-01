import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { useSocket } from "../contexts/SocketContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Smile,
  Paperclip,
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import store, { Message as StoreMessage } from "@/services/inMemoryStore";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
  senderAvatar?: string;
  isRead?: boolean;
}

interface DirectMessageProps {
  contactId?: string;
  onBack?: () => void;
}

export function DirectMessage({
  contactId = "user-1",
  onBack,
}: DirectMessageProps) {
  const { user } = useAuth();
  const username = user?.username || "Guest";
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [contactTyping, setContactTyping] = useState(false);
  const [contact, setContact] = useState<{
    id: string;
    name: string;
    avatar: string;
    status: "online" | "offline";
    lastSeen: string;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { socket, isConnected: connected } = useSocket();

  // Load contact information
  useEffect(() => {
    const contactUser = store.getUser(contactId);
    if (contactUser) {
      setContact({
        id: contactUser.id,
        name: contactUser.username,
        avatar:
          contactUser.avatar ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${contactUser.username}`,
        status: contactUser.status,
        lastSeen: contactUser.lastSeen
          ? contactUser.lastSeen.toLocaleString()
          : "unknown",
      });
    }

    // Listen for status changes
    const handleStatusChange = (data: {
      userId: string;
      status: "online" | "offline";
    }) => {
      if (data.userId === contactId) {
        setContact((prev) =>
          prev
            ? {
                ...prev,
                status: data.status,
                lastSeen:
                  data.status === "offline"
                    ? new Date().toLocaleString()
                    : prev.lastSeen,
              }
            : null,
        );
      }
    };

    store.on("userStatusChanged", handleStatusChange);

    return () => {
      store.off("userStatusChanged", handleStatusChange);
    };
  }, [contactId]);

  // Load messages
  useEffect(() => {
    if (!user) return;

    const loadMessages = () => {
      const directMessages = store.getDirectMessages(user.id, contactId);
      setMessages(directMessages);

      // Mark messages as read
      store.markMessagesAsRead(contactId, user.id);
    };

    loadMessages();

    // Listen for new messages
    const handleNewMessage = (newMessage: StoreMessage) => {
      if (
        (newMessage.sender === contactId && newMessage.recipient === user.id) ||
        (newMessage.sender === user.id && newMessage.recipient === contactId)
      ) {
        setMessages((prev) => [...prev, newMessage]);

        // Mark as read if from contact
        if (newMessage.sender === contactId) {
          store.markMessagesAsRead(contactId, user.id);
        }
      }
    };

    store.on("messageAdded", handleNewMessage);

    return () => {
      store.off("messageAdded", handleNewMessage);
    };
  }, [user, contactId]);

  useEffect(() => {
    if (!socket) return;

    // Listen for typing indicators
    socket.on("typing", (data: { user: string; recipient: string }) => {
      if (data.user === contact?.id && data.recipient === user?.id) {
        setContactTyping(true);

        // Clear typing indicator after 3 seconds
        setTimeout(() => {
          setContactTyping(false);
        }, 3000);
      }
    });

    return () => {
      socket.off("typing");
    };
  }, [socket, contact?.id, user?.id]);

  const handleSendMessage = () => {
    if (message.trim() && user && contact) {
      const newMessage: StoreMessage = {
        id: `${Date.now()}-${Math.random()}`,
        text: message,
        sender: user.id,
        senderAvatar:
          user?.avatar ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        timestamp: Date.now(),
        recipient: contact.id,
        isRead: false,
      };

      // Add message to store
      store.addMessage(newMessage);
      setMessage("");

      // Focus back on input after sending
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleTyping = () => {
    if (!isTyping && socket && connected && user && contact) {
      setIsTyping(true);

      // Emit typing event
      store.emit("userTyping", { user: user.id, recipient: contact.id });

      // Reset typing status after 3 seconds
      setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!contact) {
    return (
      <div className="flex items-center justify-center h-full">
        Contact not found
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col h-full bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-lg overflow-hidden backdrop-blur-lg bg-black/30 border border-white/10 shadow-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/10">
        <div className="flex items-center">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 rounded-full"
              onClick={onBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={contact.avatar} />
            <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{contact.name}</h2>
            <p className="text-xs text-gray-400">
              {contact.status === "online" ? (
                <span className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                  Online
                </span>
              ) : (
                `Last seen ${contact.lastSeen}`
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Phone className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Voice call</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Video className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Video call</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>More options</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg, index) => {
            const isCurrentUser = msg.sender === user?.id;
            const showAvatar =
              index === 0 || messages[index - 1].sender !== msg.sender;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} max-w-[80%] items-end gap-2`}
                >
                  {!isCurrentUser && showAvatar ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={contact.avatar} />
                      <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  ) : !isCurrentUser ? (
                    <div className="w-8"></div>
                  ) : null}

                  <div
                    className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isCurrentUser
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none"
                          : "bg-gray-700/80 text-gray-100 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    <div className="flex items-center mt-1 text-xs text-gray-400">
                      <span>{formatTime(msg.timestamp)}</span>
                      {isCurrentUser && (
                        <span className="ml-1">
                          {msg.isRead ? (
                            <svg
                              className="h-3 w-3 text-blue-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="h-3 w-3 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Typing indicator */}
          <AnimatePresence>
            {contactTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={contact.avatar} />
                  <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="bg-gray-700/60 backdrop-blur-sm rounded-full px-3 py-2">
                  <div className="flex space-x-1">
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1, 0.8] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-2 h-2 bg-gray-300 rounded-full"
                    />
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1, 0.8] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 bg-gray-300 rounded-full"
                    />
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1, 0.8] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 bg-gray-300 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Message input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center space-x-2 bg-white/5 rounded-lg p-1 border border-white/10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-gray-400 hover:text-white"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Attach file</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyUp={handleTyping}
            onKeyDown={(e) =>
              e.key === "Enter" && !e.shiftKey && handleSendMessage()
            }
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-white"
          />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-gray-400 hover:text-white"
                >
                  <Smile className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add emoji</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            onClick={handleSendMessage}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-full px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default DirectMessage;
