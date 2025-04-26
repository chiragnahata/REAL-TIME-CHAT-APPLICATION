import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { useSocket } from "../contexts/SocketContext";
import { MessageList } from "./MessageList";
import { RoomSelector, Room } from "./RoomSelector";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Smile, Paperclip, Users, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
  room: string;
  senderAvatar?: string;
}

export function ChatInterface() {
  const { user } = useAuth();
  const username = user?.username || "Guest";
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: "general",
      name: "General",
      description: "General discussion",
      members: 24,
    },
    {
      id: "tech",
      name: "Tech Talk",
      description: "All things technology",
      members: 18,
    },
    { id: "random", name: "Random", description: "Random topics", members: 12 },
    {
      id: "space",
      name: "Space Explorers",
      description: "Discussions about space and astronomy",
      members: 9,
    },
  ]);
  const [currentRoom, setCurrentRoom] = useState("general");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const [activeUsers, setActiveUsers] = useState<string[]>([
    "Alex",
    "Taylor",
    "Jordan",
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  const { socket, isConnected: connected } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Listen for incoming messages
    socket.on("message", (newMessage: Message) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    // Listen for typing indicators
    socket.on("typing", (data: { user: string; room: string }) => {
      if (data.room === currentRoom && data.user !== username) {
        setTypingUsers((prev) => {
          if (!prev.includes(data.user)) {
            return [...prev, data.user];
          }
          return prev;
        });

        // Clear typing indicator after 3 seconds
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter((user) => user !== data.user));
        }, 3000);
      }
    });

    // Join the default room
    socket.emit("joinRoom", { username, room: currentRoom });

    return () => {
      socket.off("message");
      socket.off("typing");
    };
  }, [socket, username, currentRoom]);

  // Handle room change
  useEffect(() => {
    if (!socket || !connected) return;

    // Leave current room and join new room
    socket.emit("leaveRoom", { username, room: currentRoom });
    socket.emit("joinRoom", { username, room: currentRoom });

    // Clear messages when changing rooms
    setMessages([]);

    // Generate some mock messages for the room
    const mockMessages = generateMockMessages(currentRoom, 5);
    setTimeout(() => {
      setMessages(mockMessages);
    }, 500);
  }, [currentRoom, socket, connected, username]);

  // Generate mock messages for demo purposes
  const generateMockMessages = (roomId: string, count: number): Message[] => {
    const users = ["Alex", "Taylor", "Jordan", username];
    const now = Date.now();
    const mockMessages: Message[] = [];

    for (let i = 0; i < count; i++) {
      const sender = users[Math.floor(Math.random() * users.length)];
      const isCurrentUser = sender === username;

      mockMessages.push({
        id: `mock-${i}-${now}`,
        text: getRandomMessage(roomId),
        sender: sender,
        senderAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${sender}`,
        timestamp: now - (count - i) * 60000 - Math.random() * 30000,
        room: roomId,
      });
    }

    return mockMessages;
  };

  const getRandomMessage = (roomId: string): string => {
    const messages = {
      general: [
        "Hey everyone! How's it going?",
        "Just joined this awesome platform!",
        "Anyone have recommendations for good sci-fi books?",
        "The new UI looks amazing!",
        "Hello from the other side of the galaxy!",
      ],
      tech: [
        "Did you see the latest React update?",
        "I'm working on a new project with Framer Motion",
        "TypeScript has been a game changer for my workflow",
        "What's your favorite tech stack?",
        "Just deployed my first serverless function!",
      ],
      random: [
        "Just saw the most amazing sunset!",
        "Anyone else a coffee addict here?",
        "What's your favorite movie?",
        "I could really go for some pizza right now",
        "Just adopted a puppy!",
      ],
      space: [
        "The James Webb telescope images are mind-blowing",
        "Did you know that Saturn's rings are disappearing?",
        "I'm fascinated by black holes",
        "The northern lights are on my bucket list",
        "Mars colonization might happen in our lifetime!",
      ],
    };

    const roomMessages =
      messages[roomId as keyof typeof messages] || messages.general;
    return roomMessages[Math.floor(Math.random() * roomMessages.length)];
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: `${Date.now()}-${Math.random()}`,
        text: message,
        sender: username,
        senderAvatar:
          user?.avatar ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        timestamp: Date.now(),
        room: currentRoom,
      };

      if (socket && connected) {
        socket.emit("sendMessage", newMessage);
      }

      setMessages((prev) => [...prev, newMessage]);
      setMessage("");

      // Focus back on input after sending
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleTyping = () => {
    if (!isTyping && socket && connected) {
      setIsTyping(true);
      socket.emit("typing", { user: username, room: currentRoom });

      // Reset typing status after 3 seconds
      setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    }
  };

  const handleCreateRoom = (name: string, description?: string) => {
    const newRoom = {
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      description,
      members: 1,
    };

    setRooms((prev) => [...prev, newRoom]);
    setCurrentRoom(newRoom.id);
  };

  const currentRoomData = rooms.find((r) => r.id === currentRoom);

  return (
    <motion.div
      className="flex h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col w-full max-w-6xl mx-auto rounded-lg overflow-hidden backdrop-blur-lg bg-black/30 border border-white/10 shadow-xl">
        <div className="flex flex-1 overflow-hidden">
          {/* Room selector */}
          <div className="w-64 border-r border-white/10 p-4 bg-black/20">
            <RoomSelector
              rooms={rooms}
              currentRoom={currentRoom}
              onSelectRoom={setCurrentRoom}
              onCreateRoom={handleCreateRoom}
              username={username}
            />
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/10">
              <div>
                <h2 className="text-xl font-bold flex items-center">
                  <span className="mr-2">#</span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                    {currentRoomData?.name || "Chat"}
                  </span>
                </h2>
                {currentRoomData?.description && (
                  <div className="text-sm text-gray-400">
                    {currentRoomData.description}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        onClick={() => setShowRoomInfo(!showRoomInfo)}
                      >
                        <Info className="h-5 w-5 text-gray-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Room information</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                      >
                        <Users className="h-5 w-5 text-gray-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View members</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                  {connected ? "Connected" : "Disconnected"}
                </div>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              <div className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 p-4">
                  <MessageList
                    messages={messages.map((msg) => ({
                      id: msg.id,
                      content: msg.text,
                      sender: {
                        id:
                          msg.sender === username ? "currentUser" : msg.sender,
                        name: msg.sender,
                        avatar: msg.senderAvatar,
                      },
                      timestamp: new Date(msg.timestamp),
                      status: "read",
                    }))}
                    currentUserId="currentUser"
                    isTyping={typingUsers.map((user) => ({
                      userId: user,
                      name: user,
                    }))}
                  />
                </ScrollArea>

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
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {showRoomInfo && (
                  <motion.div
                    className="w-64 border-l border-white/10 p-4 bg-black/20"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">Room Info</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full"
                        onClick={() => setShowRoomInfo(false)}
                      >
                        &times;
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-400">
                          Created
                        </h4>
                        <p className="text-sm">3 days ago</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-400">
                          Members
                        </h4>
                        <p className="text-sm">
                          {currentRoomData?.members || 0} members
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">
                          Active Now
                        </h4>
                        <div className="space-y-2">
                          {activeUsers.map((user) => (
                            <div
                              key={user}
                              className="flex items-center space-x-2"
                            >
                              <div className="relative">
                                <img
                                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user}`}
                                  alt={user}
                                  className="h-6 w-6 rounded-full"
                                />
                                <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 border border-black"></div>
                              </div>
                              <span className="text-sm">{user}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Add default export
export default ChatInterface;
