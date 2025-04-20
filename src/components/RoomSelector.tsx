import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Users, Hash, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Room {
  id: string;
  name: string;
  description: string;
  activeUsers: number;
  lastMessage?: {
    sender: string;
    content: string;
    timestamp: string;
  };
  joined: boolean;
}

interface RoomSelectorProps {
  onRoomSelect?: (roomId: string) => void;
  currentRoomId?: string;
}

const RoomSelector = ({
  onRoomSelect = () => {},
  currentRoomId = "",
}: RoomSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");

  // Mock data for rooms
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: "1",
      name: "General Chat",
      description: "Public chat room for everyone",
      activeUsers: 24,
      lastMessage: {
        sender: "Alex",
        content: "Has anyone tried the new update?",
        timestamp: "10:45 AM",
      },
      joined: true,
    },
    {
      id: "2",
      name: "Tech Talk",
      description: "Discussions about technology",
      activeUsers: 12,
      lastMessage: {
        sender: "Sam",
        content: "The new AI features are amazing!",
        timestamp: "9:30 AM",
      },
      joined: true,
    },
    {
      id: "3",
      name: "Space Explorers",
      description: "For those interested in space exploration",
      activeUsers: 8,
      joined: false,
    },
    {
      id: "4",
      name: "Gaming Squad",
      description: "Gaming discussions and team-ups",
      activeUsers: 15,
      joined: false,
    },
    {
      id: "5",
      name: "Movie Buffs",
      description: "Film discussions and recommendations",
      activeUsers: 10,
      joined: false,
    },
  ]);

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const joinedRooms = filteredRooms.filter((room) => room.joined);
  const availableRooms = filteredRooms.filter((room) => !room.joined);

  const handleCreateRoom = () => {
    if (newRoomName.trim()) {
      const newRoom: Room = {
        id: `room-${Date.now()}`,
        name: newRoomName,
        description: newRoomDescription || "No description provided",
        activeUsers: 1,
        joined: true,
      };

      setRooms([...rooms, newRoom]);
      setNewRoomName("");
      setNewRoomDescription("");
      setIsCreateRoomOpen(false);
      onRoomSelect(newRoom.id);
    }
  };

  const handleJoinRoom = (roomId: string) => {
    setRooms(
      rooms.map((room) =>
        room.id === roomId ? { ...room, joined: true } : room,
      ),
    );
    onRoomSelect(roomId);
  };

  const handleLeaveRoom = (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRooms(
      rooms.map((room) =>
        room.id === roomId ? { ...room, joined: false } : room,
      ),
    );

    if (currentRoomId === roomId && joinedRooms.length > 1) {
      const nextRoom = joinedRooms.find((room) => room.id !== roomId);
      if (nextRoom) onRoomSelect(nextRoom.id);
    }
  };

  const roomVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut",
      },
    }),
  };

  return (
    <div className="h-full w-full flex flex-col bg-background/80 backdrop-blur-sm border-r border-border rounded-l-lg overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-semibold mb-4">Chat Rooms</h2>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/50"
          />
        </div>

        <Dialog open={isCreateRoomOpen} onOpenChange={setIsCreateRoomOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" variant="default">
              <Plus className="mr-2 h-4 w-4" /> Create Room
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Room</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="room-name" className="text-sm font-medium">
                  Room Name
                </label>
                <Input
                  id="room-name"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Enter room name"
                />
              </div>
              <div className="grid gap-2">
                <label
                  htmlFor="room-description"
                  className="text-sm font-medium"
                >
                  Description (Optional)
                </label>
                <Input
                  id="room-description"
                  value={newRoomDescription}
                  onChange={(e) => setNewRoomDescription(e.target.value)}
                  placeholder="Enter room description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateRoomOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateRoom}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="flex-1 px-2">
        {joinedRooms.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-muted-foreground px-2 py-2">
              JOINED ROOMS
            </h3>
            <div className="space-y-1">
              {joinedRooms.map((room, index) => (
                <motion.div
                  key={room.id}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={roomVariants}
                  onClick={() => onRoomSelect(room.id)}
                  className={`p-2 rounded-md cursor-pointer transition-colors flex items-start justify-between group ${currentRoomId === room.id ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"}`}
                >
                  <div className="flex items-start space-x-3 overflow-hidden">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                        <Hash className="h-3.5 w-3.5 text-primary" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center">
                        <p className="font-medium truncate">{room.name}</p>
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {room.activeUsers}
                        </Badge>
                      </div>
                      {room.lastMessage && (
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          <span className="font-medium">
                            {room.lastMessage.sender}:
                          </span>{" "}
                          {room.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                          onClick={(e) => handleLeaveRoom(room.id, e)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Leave room</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {availableRooms.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground px-2 py-2">
              AVAILABLE ROOMS
            </h3>
            <div className="space-y-1">
              {availableRooms.map((room, index) => (
                <motion.div
                  key={room.id}
                  custom={index + joinedRooms.length}
                  initial="hidden"
                  animate="visible"
                  variants={roomVariants}
                  className="p-2 rounded-md cursor-pointer transition-colors hover:bg-accent/50 flex items-start justify-between group"
                >
                  <div className="flex items-start space-x-3 overflow-hidden">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                        <Hash className="h-3.5 w-3.5 text-primary" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center">
                        <p className="font-medium truncate">{room.name}</p>
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {room.activeUsers}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {room.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                    onClick={() => handleJoinRoom(room.id)}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {filteredRooms.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-center p-4">
            <Users className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No rooms found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try a different search or create a new room
            </p>
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t border-border mt-auto">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=user123"
              alt="User"
            />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">Current User</p>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomSelector;
