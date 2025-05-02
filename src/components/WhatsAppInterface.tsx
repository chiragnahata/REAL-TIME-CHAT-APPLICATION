import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ContactsList } from "./ContactsList";
import { DirectMessage } from "./DirectMessage";
import { useAuth } from "@/contexts/AuthContext";
import store from "@/services/inMemoryStore";

export function WhatsAppInterface() {
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { user } = useAuth();

  // Check for mobile screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Set user status to online when component mounts
  useEffect(() => {
    if (user) {
      store.setUserStatus(user.id, "online");

      return () => {
        // Set user status to offline when component unmounts
        store.setUserStatus(user.id, "offline");
      };
    }
  }, [user]);

  const handleSelectContact = (contactId: string) => {
    setSelectedContact(contactId);
  };

  const handleBack = () => {
    setSelectedContact(null);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4">
      <div className="flex flex-col w-full max-w-6xl mx-auto rounded-lg overflow-hidden backdrop-blur-lg bg-black/30 border border-white/10 shadow-xl">
        <div className="flex flex-1 overflow-hidden">
          {/* Mobile view */}
          {isMobile ? (
            <AnimatePresence mode="wait" initial={false}>
              {selectedContact ? (
                <motion.div
                  key="direct-message"
                  className="w-full h-full"
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <DirectMessage
                    contactId={selectedContact}
                    onBack={handleBack}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="contacts-list"
                  className="w-full h-full"
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 300, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ContactsList onSelectContact={handleSelectContact} />
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            /* Desktop view */
            <>
              <div className="w-1/3 h-full">
                <ContactsList onSelectContact={handleSelectContact} />
              </div>
              <div className="w-2/3 h-full">
                {selectedContact ? (
                  <DirectMessage contactId={selectedContact} />
                ) : (
                  <div className="h-full flex items-center justify-center bg-black/20">
                    <div className="text-center p-8">
                      <div className="flex justify-center mb-4">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                          <svg
                            className="h-12 w-12 text-indigo-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                        </div>
                      </div>
                      <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
                        Welcome, {user?.username || "User"}
                      </h2>
                      <p className="text-gray-400 max-w-md">
                        Select a contact to start messaging or create a new
                        conversation
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default WhatsAppInterface;
