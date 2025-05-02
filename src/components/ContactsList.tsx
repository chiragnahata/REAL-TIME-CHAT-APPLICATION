import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Search, Plus, MessageSquare } from "lucide-react";
import { Badge } from "./ui/badge";
import store, { User } from "@/services/inMemoryStore";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "offline";
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

interface ContactsListProps {
  onSelectContact: (contactId: string) => void;
}

export function ContactsList({ onSelectContact }: ContactsListProps) {
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const navigate = useNavigate();

  // Load contacts from store
  useEffect(() => {
    if (!currentUser) return;

    const loadContacts = () => {
      const users = store.getAllUsers();
      const contactsList: Contact[] = [];

      for (const user of users) {
        // Skip current user
        if (user.id === currentUser.id) continue;

        // Get last message between users
        const messages = store.getDirectMessages(currentUser.id, user.id);
        const lastMessage =
          messages.length > 0 ? messages[messages.length - 1] : undefined;

        // Count unread messages
        const unreadCount = messages.filter(
          (msg) => msg.sender === user.id && !msg.isRead,
        ).length;

        contactsList.push({
          id: user.id,
          name: user.username,
          avatar:
            user.avatar ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
          status: user.status,
          lastMessage: lastMessage?.text,
          lastMessageTime: lastMessage
            ? formatMessageTime(lastMessage.timestamp)
            : undefined,
          unreadCount: unreadCount > 0 ? unreadCount : undefined,
        });
      }

      setContacts(contactsList);
    };

    loadContacts();

    // Listen for user status changes
    const handleUserStatusChange = () => loadContacts();
    store.on("userStatusChanged", handleUserStatusChange);

    // Listen for new messages
    const handleNewMessage = () => loadContacts();
    store.on("messageAdded", handleNewMessage);

    // Listen for message read status changes
    const handleMessageRead = () => loadContacts();
    store.on("messageRead", handleMessageRead);

    // Initial load of users if no contacts are available
    if (contacts.length === 0) {
      // Ensure we have some default users for testing
      const defaultUsers = [
        {
          id: "user-1",
          email: "user1@example.com",
          username: "Alice",
          status: "online" as const,
        },
        {
          id: "user-2",
          email: "user2@example.com",
          username: "Bob",
          status: "offline" as const,
        },
        {
          id: "user-3",
          email: "user3@example.com",
          username: "Charlie",
          status: "online" as const,
        },
      ];

      // Add default users if they don't exist
      for (const defaultUser of defaultUsers) {
        if (!store.getUser(defaultUser.id)) {
          store.addUser(defaultUser);
        }
      }

      // Reload contacts after adding default users
      loadContacts();
    }

    return () => {
      store.off("userStatusChanged", handleUserStatusChange);
      store.off("messageAdded", handleNewMessage);
      store.off("messageRead", handleMessageRead);
    };
  }, [currentUser, contacts.length]);

  const formatMessageTime = (timestamp: number): string => {
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ][messageDate.getDay()];
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="h-full flex flex-col bg-black/20 border-r border-white/10">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Messages
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search contacts"
            className="pl-9 bg-white/5 border-white/10 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <motion.div
                key={contact.id}
                className="p-2 rounded-lg hover:bg-white/5 cursor-pointer"
                onClick={() => {
                  onSelectContact(contact.id);
                  // Mark messages as read when selecting a contact
                  if (currentUser) {
                    store.markMessagesAsRead(contact.id, currentUser.id);
                  }
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={contact.avatar} />
                      <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {contact.status === "online" && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-gray-900"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium truncate">{contact.name}</h3>
                      <span className="text-xs text-gray-400">
                        {contact.lastMessageTime}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-400 truncate">
                        {contact.lastMessage || "No messages yet"}
                      </p>
                      {contact.unreadCount && (
                        <Badge className="ml-2 bg-indigo-600 hover:bg-indigo-700">
                          {contact.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-400">
              {searchQuery ? "No contacts found" : "No contacts available"}
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-white/10">
        <Button
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          onClick={() => navigate("/chat")}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Group Chats
        </Button>
      </div>
    </div>
  );
}

export default ContactsList;
