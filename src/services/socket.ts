import { io, Socket } from "socket.io-client";
import { getToken } from "./auth";

let socket: Socket | null = null;

export const initializeSocket = (url: string): Socket => {
  if (socket) return socket;

  const token = getToken();

  socket = io(url, {
    auth: token ? { token } : undefined,
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("Socket connected");
  });

  socket.on("disconnect", (reason) => {
    console.log(`Socket disconnected: ${reason}`);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const emitEvent = (event: string, data: any): void => {
  if (socket && socket.connected) {
    socket.emit(event, data);
  } else {
    console.warn("Socket not connected, cannot emit event:", event);
  }
};
