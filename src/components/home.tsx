import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuthForm from "./AuthForm";
import ChatInterface from "./ChatInterface";
import RoomSelector from "./RoomSelector";

const Home = () => {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if user is on mobile device
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Mock login function
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  // Mock logout function
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentRoom(null);
  };

  // Handle room selection
  const handleRoomSelect = (roomId: string) => {
    setCurrentRoom(roomId);
  };

  // Handle room exit
  const handleRoomExit = () => {
    setCurrentRoom(null);
  };

  return (
    <div
      className={`min-h-screen w-full ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"} transition-colors duration-300 relative overflow-hidden`}
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              theme === "dark"
                ? "radial-gradient(circle at 50% 50%, rgba(76, 29, 149, 0.3), rgba(17, 24, 39, 0.7))"
                : "radial-gradient(circle at 50% 50%, rgba(219, 234, 254, 0.3), rgba(243, 244, 246, 0.7))",
          }}
        />
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 10 + 5,
              height: Math.random() * 10 + 5,
              background:
                theme === "dark"
                  ? `rgba(${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(Math.random() * 200 + 55)}, 0.5)`
                  : `rgba(${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 100 + 155)}, 0.5)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-sm bg-opacity-30 border-b border-gray-700 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
          />
          <h1 className="text-xl font-bold">Cosmic Chat</h1>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {isAuthenticated && (
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </div>
      </header>

      <main className="relative z-10 container mx-auto p-4 flex flex-col md:flex-row gap-4 h-[calc(100vh-80px)]">
        <AnimatePresence mode="wait">
          {!isAuthenticated ? (
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full md:w-1/3 mx-auto"
            >
              <AuthForm onLogin={handleLogin} theme={theme} />
            </motion.div>
          ) : (
            <>
              {isMobile ? (
                <div className="w-full h-full flex flex-col">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="icon" className="mb-2">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px]">
                      <RoomSelector
                        onRoomSelect={handleRoomSelect}
                        currentRoom={currentRoom}
                        theme={theme}
                      />
                    </SheetContent>
                  </Sheet>

                  {currentRoom ? (
                    <motion.div
                      key="chat"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 overflow-hidden"
                    >
                      <ChatInterface
                        roomId={currentRoom}
                        onExit={handleRoomExit}
                        theme={theme}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="no-room"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex items-center justify-center"
                    >
                      <div className="text-center p-8 backdrop-blur-md bg-opacity-20 bg-gray-800 rounded-xl border border-gray-700">
                        <h2 className="text-xl font-bold mb-4">
                          Welcome to Cosmic Chat
                        </h2>
                        <p className="mb-4">
                          Select a room from the menu to start chatting
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex gap-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-1/4 h-full overflow-hidden"
                  >
                    <RoomSelector
                      onRoomSelect={handleRoomSelect}
                      currentRoom={currentRoom}
                      theme={theme}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-3/4 h-full overflow-hidden"
                  >
                    {currentRoom ? (
                      <ChatInterface
                        roomId={currentRoom}
                        onExit={handleRoomExit}
                        theme={theme}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center p-8 backdrop-blur-md bg-opacity-20 bg-gray-800 rounded-xl border border-gray-700">
                          <h2 className="text-xl font-bold mb-4">
                            Welcome to Cosmic Chat
                          </h2>
                          <p className="mb-4">
                            Select a room from the sidebar to start chatting
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>
              )}
            </>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Home;
