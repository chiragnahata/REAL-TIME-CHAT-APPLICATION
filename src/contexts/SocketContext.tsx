import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import store from "@/services/inMemoryStore";

// Event emitter to simulate socket events
class EventEmitter {
  private listeners: Map<string, Function[]> = new Map();

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }
}

interface SocketContextType {
  socket: EventEmitter | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<EventEmitter | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const { user, isAuthenticated } = useAuth();

  const connect = () => {
    if (!socket && user) {
      const newSocket = new EventEmitter();

      // Set up store event listeners
      store.on("messageAdded", (message: any) => {
        if (
          message.room &&
          (!message.recipient || message.recipient === user.id)
        ) {
          newSocket.emit("message", message);
        } else if (message.recipient === user.id) {
          newSocket.emit("directMessage", message);
        }
      });

      store.on("userStatusChanged", (data: any) => {
        newSocket.emit("userStatus", data);
      });

      store.on("userTyping", (data: any) => {
        if (data.room) {
          newSocket.emit("typing", data);
        }
      });

      setSocket(newSocket);
      setIsConnected(true);

      // Set user as online
      if (user) {
        store.setUserStatus(user.id, "online");
      }
    }
  };

  const disconnect = () => {
    if (socket && user) {
      // Set user as offline
      store.setUserStatus(user.id, "offline");
      setSocket(null);
      setIsConnected(false);
    }
  };

  // Auto-connect when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, user]);

  const value = {
    socket,
    isConnected,
    connect,
    disconnect,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
