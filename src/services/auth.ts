import { LoginFormValues, SignupFormValues } from "@/types/auth";
import store, { User } from "./inMemoryStore";

const STORAGE_KEY = "cosmic_chat_auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

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

// Login function
export const login = async (credentials: LoginFormValues): Promise<User> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const user = store.getUserByEmail(credentials.email);

  if (
    !user ||
    (credentials.email === "chiragnahata05@gmail.com" &&
      credentials.password !== "Chirag@2005") ||
    (credentials.email !== "chiragnahata05@gmail.com" &&
      credentials.password !== "password")
  ) {
    // Password check for demo
    throw new Error("Invalid email or password");
  }

  // Update user status
  store.setUserStatus(user.id, "online");

  const authState: AuthState = {
    user,
    isAuthenticated: true,
    token: `token-${Date.now()}`,
  };

  saveAuthState(authState);
  return user;
};

// Signup function
export const signup = async (userData: SignupFormValues): Promise<User> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const email = userData.email.toLowerCase();
  const existingUser = store.getUserByEmail(email);

  if (existingUser) {
    throw new Error("Email already in use");
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    email: email,
    username: userData.username,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
    status: "online",
  };

  // Add user to store
  store.addUser(newUser);

  const authState: AuthState = {
    user: newUser,
    isAuthenticated: true,
    token: `token-${Date.now()}`,
  };

  saveAuthState(authState);
  return newUser;
};

// Logout function
export const logout = (): void => {
  const authState = getInitialAuthState();
  if (authState.user) {
    store.setUserStatus(authState.user.id, "offline");
  }

  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  const authState = getInitialAuthState();
  if (authState.user) {
    // Get fresh user data from store
    const freshUser = store.getUser(authState.user.id);
    return freshUser || authState.user;
  }
  return null;
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

// Initialize with the specified user if it doesn't exist
export const initializeDefaultUsers = (): void => {
  const defaultEmail = "chiragnahata05@gmail.com";

  if (!store.getUserByEmail(defaultEmail)) {
    store.addUser({
      id: "user-chirag",
      email: defaultEmail,
      username: "Chirag",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chirag",
      status: "offline",
    });
  }
};

// Call this function to ensure default user exists
initializeDefaultUsers();
