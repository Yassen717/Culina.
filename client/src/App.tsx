import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import RecipeView from "@/pages/RecipeView";
import Explore from "@/pages/Explore";
import Create from "@/pages/Create";
import Profile from "@/pages/Profile";
import Activity from "@/pages/Activity";
import Settings from "@/pages/Settings";
import AuthPage from "@/pages/AuthPage";
import { BottomNav, Sidebar } from "@/components/Navigation";

function Router() {
  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <Sidebar />
      <main className="flex-1 md:ml-64 min-h-screen w-full">
        <Switch>
          <ProtectedRoute path="/" component={Home} />
          <ProtectedRoute path="/explore" component={Explore} />
          <ProtectedRoute path="/create" component={Create} />
          <ProtectedRoute path="/activity" component={Activity} />
          <ProtectedRoute path="/profile" component={Profile} />
          <ProtectedRoute path="/settings" component={Settings} />
          <ProtectedRoute path="/recipe/:id" component={RecipeView} />
          <Route path="/auth" component={AuthPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="culina-theme">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
