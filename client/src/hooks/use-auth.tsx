import { createContext, ReactNode, useContext, useState } from "react";
import { useLocation } from "wouter";
import { User, MOCK_USERS } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: {
    mutate: (credentials: any) => void;
    isPending: boolean;
  };
  logoutMutation: {
    mutate: () => void;
  };
  registerMutation: {
    mutate: (credentials: any) => void;
    isPending: boolean;
  };
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const loginMutation = {
    isPending: isLoading,
    mutate: async (credentials: any) => {
      setIsLoading(true);
      // Simulate API delay
      setTimeout(() => {
        // Mock login logic: just pick the first user from MOCK_USERS for demo
        // In a real app, this would validate credentials
        const mockUser = MOCK_USERS['user1'];
        setUser(mockUser);
        setIsLoading(false);
        toast({
          title: "Welcome back!",
          description: `Signed in as ${mockUser.name}`,
        });
        setLocation("/");
      }, 1000);
    },
  };

  const registerMutation = {
    isPending: isLoading,
    mutate: async (credentials: any) => {
      setIsLoading(true);
      setTimeout(() => {
        // Mock registration logic
        const newUser: User = {
          id: 'user_new',
          name: 'New Chef',
          handle: '@newchef',
          avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&h=150&fit=crop&crop=faces',
          bio: 'Just joined Culina! 🍳',
          followers: 0,
          following: 0,
        };
        setUser(newUser);
        setIsLoading(false);
        toast({
          title: "Account created!",
          description: "Welcome to the community.",
        });
        setLocation("/");
      }, 1000);
    },
  };

  const logoutMutation = {
    mutate: () => {
      setUser(null);
      setLocation("/auth");
      toast({
        title: "Signed out",
        description: "See you next time!",
      });
    },
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error: null,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
