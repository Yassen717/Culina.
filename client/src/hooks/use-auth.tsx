import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { User } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { account } from "@/lib/appwrite";
import { authService, type Profile } from "@/lib/appwrite-services";
import { ID } from "appwrite";

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = await account.get();

      // Fetch or create user profile
      const userProfile = await authService.ensureProfile(
        session.$id,
        session.name,
        session.email
      );

      if (userProfile) {
        setProfile(userProfile);
        // Convert profile to User format for backward compatibility
        setUser({
          id: userProfile.userId,
          name: userProfile.name,
          handle: userProfile.handle,
          avatar: userProfile.avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&h=150&fit=crop&crop=faces',
          bio: userProfile.bio || '',
          followers: userProfile.followersCount,
          following: userProfile.followingCount,
        });
      }
    } catch (error) {
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loginMutation = {
    isPending: isLoading,
    mutate: async ({ email, password }: any) => {
      setIsLoading(true);
      try {
        await account.createEmailPasswordSession(email, password);
        await checkSession();
        toast({
          title: "Welcome back!",
          description: "Successfully logged in.",
        });
        setLocation("/");
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message || "Please check your credentials.",
        });
        setIsLoading(false);
      }
    },
  };

  const registerMutation = {
    isPending: isLoading,
    mutate: async ({ email, password, name }: any) => {
      setIsLoading(true);
      try {
        await account.create(ID.unique(), email, password, name);
        await account.createEmailPasswordSession(email, password);
        await checkSession();
        toast({
          title: "Account created!",
          description: "Welcome to Culina.",
        });
        setLocation("/");
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: error.message,
        });
        setIsLoading(false);
      }
    },
  };

  const logoutMutation = {
    mutate: async () => {
      try {
        await account.deleteSession('current');
        setUser(null);
        setLocation("/auth");
        toast({
          title: "Signed out",
          description: "See you next time!",
        });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Logout failed",
          description: error.message,
        });
      }
    },
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
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
