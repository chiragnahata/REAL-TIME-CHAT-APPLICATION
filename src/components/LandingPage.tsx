import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Rocket, MessageSquare, Users, Star, ChevronRight } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const parallaxValue = scrollY * 0.5;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-950 text-white overflow-hidden">
      {/* Hero Section */}
      <div className="relative h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* Animated stars background */}
        <div className="absolute inset-0 z-0">
          {[...Array(100)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 3 + 1 + "px",
                height: Math.random() * 3 + 1 + "px",
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>

        {/* Floating planet */}
        <motion.div
          className="absolute z-0"
          style={{
            top: "20%",
            right: "15%",
            y: -parallaxValue,
          }}
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 opacity-70 blur-sm" />
        </motion.div>

        {/* Content */}
        <motion.div
          className="z-10 text-center max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600"
            animate={{
              textShadow: [
                "0 0 5px rgba(167, 139, 250, 0.5)",
                "0 0 20px rgba(167, 139, 250, 0.8)",
                "0 0 5px rgba(167, 139, 250, 0.5)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Cosmic Chat
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl mb-8 text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Join the interstellar conversation with our real-time messaging
            platform
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
              onClick={() => navigate("/login")}
            >
              Get Started <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-purple-500 text-purple-300 hover:bg-purple-950/30"
              onClick={() => {
                const featuresSection = document.getElementById("features");
                featuresSection?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Learn More
            </Button>
          </motion.div>
          <motion.div
            className="mt-6 text-sm text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <p>
              Demo credentials:{" "}
              <span className="font-mono">demo@cosmicchat.com / demo1234</span>
            </p>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-white"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          Out-of-this-World Features
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <MessageSquare className="h-8 w-8 text-blue-400" />,
              title: "Real-Time Messaging",
              description:
                "Instant message delivery with typing indicators and read receipts",
            },
            {
              icon: <Users className="h-8 w-8 text-purple-400" />,
              title: "Group Chat Rooms",
              description:
                "Create and join different themed chat rooms for any topic",
            },
            {
              icon: <Rocket className="h-8 w-8 text-pink-400" />,
              title: "Futuristic UI",
              description:
                "Immersive sci-fi themed interface with fluid animations",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="bg-gradient-to-br from-gray-900/80 to-purple-950/80 backdrop-blur-lg p-6 rounded-xl border border-purple-900/50"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              whileHover={{
                y: -5,
                boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.2)",
              }}
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-white">
                {feature.title}
              </h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
            onClick={() => navigate("/login")}
          >
            Start Chatting Now <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-purple-900/30 text-center text-gray-400 text-sm">
        <div className="flex justify-center space-x-4 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className="h-5 w-5 text-yellow-400 opacity-80"
              fill={star <= 5 ? "currentColor" : "none"}
            />
          ))}
        </div>
        <p>© {new Date().getFullYear()} Cosmic Chat. All rights reserved.</p>
        <p className="mt-2">A futuristic messaging experience</p>
      </footer>
    </div>
  );
};

export default LandingPage;
