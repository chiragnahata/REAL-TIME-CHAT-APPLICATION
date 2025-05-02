// In-memory data store for the chat application

// User data store
export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  status: "online" | "offline";
  lastSeen?: Date;
}

// Message data store
export interface Message {
  id: string;
  text: string;
  sender: string;
  senderAvatar?: string;
  timestamp: number;
  room?: string;
  recipient?: string;
  isRead: boolean;
}

// Room data store
export interface Room {
  id: string;
  name: string;
  description?: string;
  members: number;
  createdAt: number;
}

// In-memory database
class InMemoryStore {
  private users: Map<string, User> = new Map();
  private messages: Message[] = [];
  private rooms: Map<string, Room> = new Map();
  private activeUsers: Set<string> = new Set();
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    // No default rooms - users will create their own
  }

  // User methods
  addUser(user: User): void {
    this.users.set(user.id, user);
    this.emit("userAdded", user);
  }

  getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }

  getUserByEmail(email: string): User | undefined {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  setUserStatus(userId: string, status: "online" | "offline"): void {
    const user = this.users.get(userId);
    if (user) {
      user.status = status;
      if (status === "online") {
        this.activeUsers.add(userId);
      } else {
        user.lastSeen = new Date();
        this.activeUsers.delete(userId);
      }
      this.emit("userStatusChanged", { userId, status });
    }
  }

  getActiveUsers(): User[] {
    return Array.from(this.activeUsers)
      .map((id) => this.users.get(id))
      .filter(Boolean) as User[];
  }

  // Message methods
  addMessage(message: Message): void {
    this.messages.push(message);
    this.emit("messageAdded", message);
  }

  getMessagesByRoom(roomId: string): Message[] {
    return this.messages.filter((msg) => msg.room === roomId);
  }

  getDirectMessages(userId1: string, userId2: string): Message[] {
    return this.messages.filter(
      (msg) =>
        (msg.sender === userId1 && msg.recipient === userId2) ||
        (msg.sender === userId2 && msg.recipient === userId1),
    );
  }

  markMessagesAsRead(senderId: string, recipientId: string): void {
    let hasChanges = false;

    this.messages.forEach((msg) => {
      if (
        msg.sender === senderId &&
        msg.recipient === recipientId &&
        !msg.isRead
      ) {
        msg.isRead = true;
        hasChanges = true;
        this.emit("messageRead", msg);
      }
    });

    // Only emit the event if there were actual changes
    if (hasChanges) {
      this.emit("messagesUpdated", { senderId, recipientId });
    }
  }

  // Room methods
  addRoom(room: Room): void {
    this.rooms.set(room.id, room);
    this.emit("roomAdded", room);
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  joinRoom(userId: string, roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.members += 1;
      this.emit("userJoinedRoom", { userId, roomId });
    }
  }

  leaveRoom(userId: string, roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room && room.members > 0) {
      room.members -= 1;
      this.emit("userLeftRoom", { userId, roomId });
    }
  }

  // Event system for real-time updates
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(callback);
  }

  off(event: string, callback: Function): void {
    const callbacks = this.eventListeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const callbacks = this.eventListeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }
}

// Create a singleton instance
const store = new InMemoryStore();
export default store;
