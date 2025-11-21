import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Moon, Sun, Bell, Lock, User, LogOut, Smartphone } from "lucide-react";
import { Link } from "wouter";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { logoutMutation, user } = useAuth();

  return (
    <div className="pb-20 md:pb-0 max-w-2xl mx-auto animate-in slide-in-from-right duration-500">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md p-4 border-b border-border flex items-center gap-4">
        <Link href="/profile">
          <Button variant="ghost" size="icon" className="-ml-2">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <h1 className="text-xl font-serif font-bold">Settings</h1>
      </div>

      <div className="p-6 space-y-8">
        {/* Appearance Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Sun size={20} />
            <h2 className="font-bold text-lg">Appearance</h2>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>
                Customize how Culina looks on your device.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <Label className="text-base">Theme Mode</Label>
                  <span className="text-sm text-muted-foreground">
                    Select your preferred display mode
                  </span>
                </div>
                <Select value={theme} onValueChange={(val: any) => setTheme(val)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun size={14} /> Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon size={14} /> Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Smartphone size={14} /> System
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Notifications Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Bell size={20} />
            <h2 className="font-bold text-lg">Notifications</h2>
          </div>
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <Label className="text-base">Push Notifications</Label>
                  <span className="text-sm text-muted-foreground">
                    Receive alerts about new likes and comments
                  </span>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <Label className="text-base">Email Digest</Label>
                  <span className="text-sm text-muted-foreground">
                    Weekly summary of top recipes
                  </span>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Account Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <User size={20} />
            <h2 className="font-bold text-lg">Account</h2>
          </div>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between p-2 hover:bg-muted rounded-lg cursor-pointer transition-colors">
                <div className="flex flex-col gap-1">
                  <span className="font-medium">Edit Profile</span>
                  <span className="text-sm text-muted-foreground">Change your name, bio, and avatar</span>
                </div>
                <ArrowLeft size={16} className="rotate-180 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-muted rounded-lg cursor-pointer transition-colors">
                <div className="flex flex-col gap-1">
                  <span className="font-medium">Privacy & Security</span>
                  <span className="text-sm text-muted-foreground">Manage your password and connected accounts</span>
                </div>
                <ArrowLeft size={16} className="rotate-180 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Danger Zone */}
        <section className="pt-4">
           <Button 
            variant="destructive" 
            className="w-full" 
            onClick={() => logoutMutation.mutate()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Culina v1.0.2 • Build 2024.11.21
          </p>
        </section>
      </div>
    </div>
  );
}
