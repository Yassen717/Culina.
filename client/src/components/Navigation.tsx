import { Link, useLocation } from "wouter";
import { Home, Search, PlusSquare, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Explore", path: "/explore" },
    { icon: PlusSquare, label: "Create", path: "/create" },
    { icon: Heart, label: "Activity", path: "/activity" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border h-16 px-6 flex items-center justify-between md:hidden">
      {navItems.map((item) => {
        const isActive = location === item.path;
        return (
          <Link key={item.label} href={item.path}>
            <div className={cn(
              "flex flex-col items-center justify-center gap-1 transition-colors duration-200",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}>
              <item.icon 
                size={24} 
                strokeWidth={isActive ? 2.5 : 2}
                className={cn("transition-transform", isActive && "scale-110")}
              />
              <span className="text-[10px] font-medium hidden">{item.label}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Explore", path: "/explore" },
    { icon: PlusSquare, label: "Create", path: "/create" },
    { icon: Heart, label: "Activity", path: "/activity" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border p-6 z-50">
      <div className="mb-10 px-2">
        <h1 className="font-serif text-3xl font-bold text-primary italic tracking-tight">Culina.</h1>
      </div>
      
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Link key={item.label} href={item.path}>
              <div className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group cursor-pointer",
                isActive 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}>
                <item.icon 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className="group-hover:scale-105 transition-transform"
                />
                <span className="text-base">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-4 py-4 border-t border-border">
        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-orange-300" />
          <div className="text-sm">
            <p className="font-medium">Guest User</p>
            <p className="text-xs text-muted-foreground">Sign Out</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
