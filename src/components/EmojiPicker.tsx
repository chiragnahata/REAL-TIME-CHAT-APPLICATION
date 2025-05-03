import { useState, useRef, useEffect } from "react";
import { Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import EmojiPickerReact, { EmojiClickData } from "emoji-picker-react";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export function EmojiPicker({ onEmojiSelect = () => {} }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={buttonRef}
          variant="ghost"
          size="icon"
          className="rounded-full text-gray-400 hover:text-white"
        >
          <Smile className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 border-gray-700 bg-gray-800 w-full"
        side="top"
        align="end"
      >
        <EmojiPickerReact
          onEmojiClick={handleEmojiClick}
          theme="dark"
          lazyLoadEmojis
          searchPlaceHolder="Search emoji..."
        />
      </PopoverContent>
    </Popover>
  );
}

export default EmojiPicker;
