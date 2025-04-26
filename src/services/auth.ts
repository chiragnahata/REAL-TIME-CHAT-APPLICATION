import { LoginFormValues, SignupFormValues } from "@/types/auth";

// This is a mock authentication service
// In production, replace with actual authentication provider like Firebase, Auth0, or Supabase

const STORAGE_KEY = "cosmic_chat_auth";

interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

// Mock user database - replace with actual database in production
const mockUsers: Record<string, { password: string; user: User }> = {
  "user@example.com": {
    password: "password123",
    user: {
      id: "user-1",
      email: "user@example.com",
      username: "Cosmic Explorer",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=cosmic",
    },
  },
  // Demo account for easy testing
  "demo@cosmicchat.com": {
    password: "demo1234",
    user: {
      id: "demo-user",
      email: "demo@cosmicchat.com",
      username: "Demo User",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
    },
  },
  // Another demo account
  "test@cosmicchat.com": {
    password: "test1234",
    user: {
      id: "test-user",
      email: "test@cosmicchat.com",
      username: "Test User",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=test",
    },
  },
};

// Initialize auth state from storage
const getInitialAuthState = (): AuthState => {
  if (typeof window === "undefined") {
    return { user: null, isAuthenticated: false, token: null };
  }

  const storedAuth = localStorage.getItem(STORAGE_KEY);
  if (storedAuth) {
    try {
      return JSON.parse(storedAuth);
    } catch (error) {
      console.error("Failed to parse stored auth data", error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  return { user: null, isAuthenticated: false, token: null };
};

// Save auth state to storage
const saveAuthState = (state: AuthState): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
};

// Mock login function
export const login = async (credentials: LoginFormValues): Promise<User> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const userRecord = mockUsers[credentials.email];

  if (!userRecord || userRecord.password !== credentials.password) {
    throw new Error("Invalid email or password");
  }

  const authState: AuthState = {
    user: userRecord.user,
    isAuthenticated: true,
    token: `mock-token-${Date.now()}`,
  };

  saveAuthState(authState);
  return userRecord.user;
};

// Mock signup function
export const signup = async (userData: SignupFormValues): Promise<User> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const email = userData.email.toLowerCase();
  if (mockUsers[email]) {
    throw new Error("Email already in use");
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    email: email,
    username: userData.username,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
  };

  // Save to local storage
  const updatedUsers = { ...mockUsers };
  updatedUsers[email] = {
    password: userData.password,
    user: newUser,
  };

  saveLocalUsers(updatedUsers);

  const authState: AuthState = {
    user: newUser,
    isAuthenticated: true,
    token: `mock-token-${Date.now()}`,
  };

  saveAuthState(authState);
  return newUser;
};

// Logout function
export const logout = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  const authState = getInitialAuthState();
  return authState.user;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const authState = getInitialAuthState();
  return authState.isAuthenticated;
};

// Get auth token
export const getToken = (): string | null => {
  const authState = getInitialAuthState();
  return authState.token;
};
