import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface TypingIndicatorProps {
  avatar: string;
  name: string;
}

export function TypingIndicator({ avatar, name }: TypingIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-start gap-2"
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatar} />
        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
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
  );
}

export default TypingIndicator;
