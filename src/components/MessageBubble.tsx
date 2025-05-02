import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface MessageBubbleProps {
  id: string;
  text: string;
  timestamp: number;
  isCurrentUser: boolean;
  senderAvatar?: string;
  senderName: string;
  isRead?: boolean;
  showAvatar?: boolean;
}

export function MessageBubble({
  id,
  text,
  timestamp,
  isCurrentUser,
  senderAvatar,
  senderName,
  isRead,
  showAvatar = true,
}: MessageBubbleProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <motion.div
      key={id}
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
            <AvatarImage src={senderAvatar} />
            <AvatarFallback>{senderName.charAt(0)}</AvatarFallback>
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
            <p className="text-sm whitespace-pre-wrap">{text}</p>
          </div>
          <div className="flex items-center mt-1 text-xs text-gray-400">
            <span>{formatTime(timestamp)}</span>
            {isCurrentUser && (
              <span className="ml-1">
                {isRead ? (
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
}

export default MessageBubble;
