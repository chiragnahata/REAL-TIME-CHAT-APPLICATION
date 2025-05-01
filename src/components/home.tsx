import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Moon,
  Sun,
  Menu,
  LogOut,
  Settings,
  User as UserIcon,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import ChatInterface from "./ChatInterface";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Home = () => {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  // Handle logout
  const handleLogout = () => {
    logout();
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
      <header className="relative z-10 backdrop-blur-sm bg-black/30 border-b border-white/10 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center"
          >
            <div className="w-4 h-4 rounded-full bg-white/20 backdrop-blur-sm"></div>
          </motion.div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Cosmic Chat
          </h1>
          <Button
            variant="ghost"
            className="ml-4 text-sm text-gray-300 hover:text-white"
            onClick={() => navigate("/messages")}
          >
            <MessageSquare className="mr-1 h-4 w-4" />
            Direct Messages
          </Button>
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full h-8 w-8 p-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={
                      user?.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`
                    }
                  />
                  <AvatarFallback>
                    {user?.username?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-gray-900 border-gray-700 text-white"
            >
              <DropdownMenuLabel className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                <span>{user?.username || "User"}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem
                className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800"
                onClick={() => {}}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-gray-800 focus:bg-gray-800"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="relative z-10 h-[calc(100vh-72px)]">
        <AnimatePresence mode="wait">
          <motion.div
            key="chat-interface"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            <ChatInterface />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Home;
