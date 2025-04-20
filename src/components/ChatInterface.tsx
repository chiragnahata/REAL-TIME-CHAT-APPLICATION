import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Smile, Paperclip, MoreVertical, Users, X } from "lucide-react";
import MessageList from "./MessageList";
import RoomSelector from "./RoomSelector";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  read: boolean;
}

interface Room {
  id: string;
  name: string;
  description?: string;
  members: number;
  lastMessage?: string;
}

interface ChatInterfaceProps {
  currentUser?: {
    id: string;
    name: string;
    avatar?: string;
  };
  onSendMessage?: (message: string, roomId: string) => void;
  onRoomChange?: (roomId: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  currentUser = {
    id: "user-1",
    name: "Cosmic Explorer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=cosmic",
  },
  onSendMessage = () => {},
  onRoomChange = () => {},
}) => {
  const [message, setMessage] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Mock data for demonstration
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: "room-1",
      name: "Galactic Hub",
      description: "Main discussion channel",
      members: 42,
    },
    {
      id: "room-2",
      name: "Mars Colony",
      description: "Red planet settlers",
      members: 23,
    },
    {
      id: "room-3",
      name: "Space Travelers",
      description: "For those on the move",
      members: 15,
    },
    {
      id: "room-4",
      name: "Quantum Physics",
      description: "Scientific discussions",
      members: 8,
    },
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      content: "Welcome to the Galactic Hub!",
      sender: {
        id: "system",
        name: "System",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=system",
      },
      timestamp: new Date(Date.now() - 3600000),
      read: true,
    },
    {
      id: "msg-2",
      content: "Hey everyone, just joined this channel. Excited to be here!",
      sender: {
        id: "user-2",
        name: "Star Voyager",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=voyager",
      },
      timestamp: new Date(Date.now() - 1800000),
      read: true,
    },
    {
      id: "msg-3",
      content: "Welcome aboard! We were just discussing the new space station.",
      sender: {
        id: "user-3",
        name: "Nebula Rider",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nebula",
      },
      timestamp: new Date(Date.now() - 900000),
      read: true,
    },
  ]);

  // Set initial room
  useEffect(() => {
    if (rooms.length > 0 && !currentRoom) {
      setCurrentRoom(rooms[0]);
      onRoomChange(rooms[0].id);
    }
  }, [rooms, currentRoom, onRoomChange]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulate typing indicators
  useEffect(() => {
    if (message && message.length > 0) {
      // In a real app, this would emit a socket event
      console.log("User is typing...");
    }

    // Simulate other users typing
    const randomTyping = setTimeout(() => {
      const shouldShowTyping = Math.random() > 0.7;
      if (shouldShowTyping) {
        setTypingUsers(["Nebula Rider"]);
        setTimeout(() => setTypingUsers([]), 3000);
      }
    }, 5000);

    return () => clearTimeout(randomTyping);
  }, [message]);

  const handleSendMessage = () => {
    if (message.trim() && currentRoom) {
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        content: message.trim(),
        sender: currentUser,
        timestamp: new Date(),
        read: false,
      };

      setMessages([...messages, newMessage]);
      onSendMessage(message, currentRoom.id);
      setMessage("");
    }
  };

  const handleRoomChange = (room: Room) => {
    setCurrentRoom(room);
    onRoomChange(room.id);
    setIsMobileSidebarOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Mobile sidebar toggle */}
      <div className="fixed bottom-4 right-4 z-20 md:hidden">
        <Button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="rounded-full h-12 w-12 flex items-center justify-center bg-primary shadow-lg hover:bg-primary/90"
        >
          {isMobileSidebarOpen ? <X size={20} /> : <Users size={20} />}
        </Button>
      </div>

      {/* Sidebar - Room Selector */}
      <AnimatePresence>
        {(isMobileSidebarOpen || window.innerWidth >= 768) && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`absolute md:relative z-10 h-full w-72 bg-gray-800/80 backdrop-blur-md border-r border-gray-700 ${isMobileSidebarOpen ? "block" : "hidden md:block"}`}
          >
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold">Chat Rooms</h2>
              <p className="text-sm text-gray-400">
                Join a room to start chatting
              </p>
            </div>
            <RoomSelector
              rooms={rooms}
              currentRoom={currentRoom}
              onRoomSelect={handleRoomChange}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Chat Header */}
        {currentRoom && (
          <div className="p-4 border-b border-gray-700 flex items-center justify-between bg-gray-800/50 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentRoom.name}`}
                />
                <AvatarFallback>
                  {currentRoom.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold">{currentRoom.name}</h3>
                <p className="text-xs text-gray-400">
                  {currentRoom.members} members
                </p>
              </div>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical size={20} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Room options</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4 overflow-y-auto">
          <MessageList messages={messages} currentUser={currentUser} />

          {/* Typing Indicators */}
          {typingUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-2 mt-2 text-gray-400 text-sm"
            >
              <div className="flex space-x-1">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce delay-100">.</span>
                <span className="animate-bounce delay-200">.</span>
              </div>
              <span>{typingUsers.join(", ")} is typing</span>
            </motion.div>
          )}

          <div ref={messageEndRef} />
        </ScrollArea>

        {/* Message Input Area */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/50 backdrop-blur-sm">
          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type a message..."
                className="min-h-[60px] max-h-[120px] w-full rounded-lg bg-gray-700/50 border-gray-600 text-white resize-none focus:ring-primary"
              />
              <div className="absolute bottom-2 right-2 flex space-x-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                      >
                        <Smile size={18} className="text-gray-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add emoji</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                      >
                        <Paperclip size={18} className="text-gray-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Attach file</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <Button
              onClick={handleSendMessage}
              className="rounded-full h-10 w-10 flex items-center justify-center bg-primary hover:bg-primary/90"
              disabled={!message.trim()}
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
