import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { CreateRoomDialog } from "./CreateRoomDialog";
import { Badge } from "./ui/badge";
import { Users } from "lucide-react";

export interface Room {
  id: string;
  name: string;
  description?: string;
  members?: number;
}

interface RoomSelectorProps {
  rooms: Room[];
  currentRoom: string;
  onSelectRoom: (roomId: string) => void;
  onCreateRoom?: (name: string, description?: string) => void;
  username: string;
  theme?: "light" | "dark";
}

export function RoomSelector({
  rooms = [],
  currentRoom = "general",
  onSelectRoom = () => {},
  onCreateRoom = () => {},
  username = "Guest",
  theme = "dark",
}: RoomSelectorProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Chat Rooms</h3>
        <Badge
          variant="outline"
          className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
        >
          {rooms.length}
        </Badge>
      </div>

      <CreateRoomDialog onCreateRoom={onCreateRoom} />

      <ScrollArea className="flex-1">
        <AnimatePresence initial={false}>
          <div className="space-y-2">
            {rooms.map((room) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant={currentRoom === room.id ? "default" : "outline"}
                  className={`w-full justify-between group ${currentRoom === room.id ? "bg-indigo-600 hover:bg-indigo-700" : "bg-white/5 hover:bg-white/10 border-white/10"}`}
                  onClick={() => onSelectRoom(room.id)}
                >
                  <div className="flex items-center">
                    <span className="mr-2">#</span>
                    <span>{room.name}</span>
                  </div>
                  {room.members !== undefined && (
                    <div className="flex items-center opacity-60 group-hover:opacity-100">
                      <Users className="h-3 w-3 mr-1" />
                      <span className="text-xs">{room.members}</span>
                    </div>
                  )}
                </Button>
                {room.description && (
                  <p className="text-xs text-gray-400 mt-1 ml-2">
                    {room.description}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </ScrollArea>

      <motion.div
        className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div>
          <div className="text-sm font-medium">Logged in as:</div>
          <div className="text-indigo-400 font-bold">{username}</div>
        </div>
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
      </motion.div>
    </div>
  );
}

// Export as default as well
export default RoomSelector;
