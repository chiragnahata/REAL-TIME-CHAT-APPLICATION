import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { useSocket } from "../contexts/SocketContext";
import { AnimatePresence, motion } from "framer-motion";
import {
  Send,
  Paperclip,
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  MessageSquare,
} from "lucide-react";
import EmojiPicker from "./EmojiPicker";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import store, { Message as StoreMessage } from "@/services/inMemoryStore";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

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
    } else {
      // Create a default contact if not found
      const defaultContact = {
        id: contactId,
        email: `${contactId}@example.com`,
        username:
          contactId === "user-1"
            ? "Alice"
            : contactId === "user-2"
              ? "Bob"
              : "Charlie",
        status: "online" as const,
      };
      store.addUser(defaultContact);

      setContact({
        id: defaultContact.id,
        name: defaultContact.username,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${defaultContact.username}`,
        status: defaultContact.status,
        lastSeen: "Just now",
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

        // Scroll to bottom when new message arrives
        setTimeout(() => {
          const scrollContainer = document.querySelector(
            "#message-scroll-area [data-radix-scroll-area-viewport]",
          );
          if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
          }
        }, 100);
      }
    };

    // Listen for message read status changes
    const handleMessageRead = (readMessage: StoreMessage) => {
      if (
        readMessage.sender === user.id &&
        readMessage.recipient === contactId
      ) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === readMessage.id ? { ...msg, isRead: true } : msg,
          ),
        );
      }
    };

    store.on("messageAdded", handleNewMessage);
    store.on("messageRead", handleMessageRead);

    return () => {
      store.off("messageAdded", handleNewMessage);
      store.off("messageRead", handleMessageRead);
    };
  }, [user, contactId]);

  useEffect(() => {
    if (!socket) return;

    // Listen for typing indicators
    socket?.on("typing", (data: { user: string; recipient: string }) => {
      if (data.user === contact?.id && data.recipient === user?.id) {
        setContactTyping(true);

        // Clear typing indicator after 3 seconds
        setTimeout(() => {
          setContactTyping(false);
        }, 3000);
      }
    });

    return () => {
      socket?.off("typing");
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

      // Simulate a reply after a random delay (for demo purposes)
      if (Math.random() > 0.3) {
        // 70% chance of reply
        const replyDelay = Math.floor(Math.random() * 3000) + 1000; // 1-4 seconds

        setTimeout(() => {
          // Show typing indicator
          setContactTyping(true);

          // Send reply after typing
          setTimeout(() => {
            setContactTyping(false);

            const replies = [
              "That's interesting!",
              "I see what you mean.",
              "Thanks for sharing that.",
              "I'll think about it.",
              "Good point!",
              "I agree with you.",
              "Let me get back to you on that.",
              "That's exactly what I was thinking!",
              "Could you explain more?",
              "I'm not sure I follow.",
            ];

            const replyMessage: StoreMessage = {
              id: `${Date.now()}-${Math.random()}`,
              text: replies[Math.floor(Math.random() * replies.length)],
              sender: contact.id,
              senderAvatar: contact.avatar,
              timestamp: Date.now(),
              recipient: user.id,
              isRead: true, // Auto-read since we're looking at it
            };

            store.addMessage(replyMessage);
          }, 1500);
        }, replyDelay);
      }

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
      <ScrollArea className="flex-1 p-4" id="message-scroll-area">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-indigo-400" />
              </div>
              <p>No messages yet</p>
              <p className="text-sm">
                Send a message to start the conversation
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isCurrentUser = msg.sender === user?.id;
              const showAvatar =
                index === 0 || messages[index - 1].sender !== msg.sender;

              return (
                <MessageBubble
                  key={msg.id}
                  id={msg.id}
                  text={msg.text}
                  timestamp={msg.timestamp}
                  isCurrentUser={isCurrentUser}
                  senderAvatar={isCurrentUser ? user?.avatar : contact.avatar}
                  senderName={isCurrentUser ? username : contact.name}
                  isRead={msg.isRead}
                  showAvatar={showAvatar}
                />
              );
            })
          )}

          {/* Typing indicator */}
          <AnimatePresence>
            {contactTyping && (
              <TypingIndicator avatar={contact.avatar} name={contact.name} />
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

          <EmojiPicker
            onEmojiSelect={(emoji) => setMessage((prev) => prev + emoji)}
          />

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
