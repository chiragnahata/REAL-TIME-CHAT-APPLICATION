import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { useSocket } from "../contexts/SocketContext";
import { MessageList } from "./MessageList";
import { RoomSelector, Room } from "./RoomSelector";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, Users, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import EmojiPicker from "./EmojiPicker";
import { useAuth } from "@/contexts/AuthContext";
import store from "@/services/inMemoryStore";

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
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState("general");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const { socket, isConnected: connected } = useSocket();

  // Load rooms from store
  useEffect(() => {
    const loadRooms = () => {
      const storeRooms = store.getAllRooms();
      setRooms(
        storeRooms.map((room) => ({
          id: room.id,
          name: room.name,
          description: room.description || "",
          members: room.members,
        })),
      );
    };

    loadRooms();

    // Listen for room changes
    store.on("roomAdded", loadRooms);

    return () => {
      store.off("roomAdded", loadRooms);
    };
  }, []);

  // Load active users
  useEffect(() => {
    const updateActiveUsers = () => {
      const active = store.getActiveUsers();
      setActiveUsers(active.map((user) => user.username));
    };

    updateActiveUsers();
    store.on("userStatusChanged", updateActiveUsers);

    return () => {
      store.off("userStatusChanged", updateActiveUsers);
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Listen for incoming messages
    socket?.on("message", (newMessage: Message) => {
      if (newMessage.room === currentRoom) {
        setMessages((prev) => [...prev, newMessage]);

        // Scroll to bottom when new message arrives
        setTimeout(() => {
          const scrollContainer = document.querySelector(
            "[data-radix-scroll-area-viewport]",
          );
          if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
          }
        }, 100);
      }
    });

    // Listen for typing indicators
    socket?.on("typing", (data: { user: string; room: string }) => {
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

    // Join the current room
    if (user) {
      store.joinRoom(user.id, currentRoom);
    }

    return () => {
      socket?.off("message");
      socket?.off("typing");
    };
  }, [socket, username, currentRoom, user]);

  // Handle room change
  useEffect(() => {
    if (!user) return;

    // Leave current room and join new room
    if (user) {
      store.leaveRoom(user.id, currentRoom);
      store.joinRoom(user.id, currentRoom);
    }

    // Load messages for the room
    const roomMessages = store.getMessagesByRoom(currentRoom);
    setMessages(roomMessages);

    // Scroll to bottom when changing rooms
    setTimeout(() => {
      const scrollContainer = document.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }, 100);
  }, [currentRoom, user]);

  const handleSendMessage = () => {
    if (message.trim() && user) {
      const newMessage = {
        id: `${Date.now()}-${Math.random()}`,
        text: message,
        sender: user.id,
        senderAvatar:
          user?.avatar ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        timestamp: Date.now(),
        room: currentRoom,
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
    if (!isTyping && socket && connected && user) {
      setIsTyping(true);

      // Emit typing event to store
      store.emit("userTyping", { user: username, room: currentRoom });

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
      createdAt: Date.now(),
    };

    // Add room to store
    store.addRoom(newRoom);

    // Update local state
    setRooms((prev) => [
      ...prev,
      {
        id: newRoom.id,
        name: newRoom.name,
        description: newRoom.description || "",
        members: newRoom.members,
      },
    ]);

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
                    messages={messages.map((msg) => {
                      const sender = store.getUser(msg.sender);
                      return {
                        id: msg.id,
                        content: msg.text,
                        sender: {
                          id:
                            msg.sender === user?.id
                              ? "currentUser"
                              : msg.sender,
                          name: sender?.username || "Unknown",
                          avatar: sender?.avatar || msg.senderAvatar,
                        },
                        timestamp: new Date(msg.timestamp),
                        status: "read",
                      };
                    })}
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

                    <EmojiPicker
                      onEmojiSelect={(emoji) =>
                        setMessage((prev) => prev + emoji)
                      }
                    />

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
                        <p className="text-sm">
                          {currentRoomData
                            ? new Date(
                                store.getRoom(currentRoomData.id)?.createdAt ||
                                  Date.now(),
                              ).toLocaleDateString()
                            : "Unknown"}
                        </p>
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
