import { Button } from '@/components/ui/button';
import { Settings, Grid, Bookmark, ChefHat } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useUserPosts } from '@/hooks/use-posts';
import { Link } from 'wouter';

export default function Profile() {
  const { user, profile } = useAuth();
  const { data: userPosts, isLoading } = useUserPosts(user?.id);

  // Fallback if user is null (though protected route prevents this)
  if (!user || !profile) return null;

  return (
    <div className="pb-20 md:pb-0">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-8">
          <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-background shadow-xl">
            <AvatarImage src={profile.avatar} alt={profile.handle} />
            <AvatarFallback>{profile.name[0]}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-2xl font-bold">{profile.handle}</h1>
              <Button variant="outline" size="sm">Edit Profile</Button>
              <Link href="/settings">
                <Button variant="ghost" size="icon"><Settings size={20} /></Button>
              </Link>
            </div>

            <div className="flex items-center gap-8 mb-4 text-sm md:text-base">
              <div className="flex flex-col md:flex-row gap-1 items-center">
                <span className="font-bold">{profile.postsCount}</span> posts
              </div>
              <div className="flex flex-col md:flex-row gap-1 items-center">
                <span className="font-bold">{profile.followersCount.toLocaleString()}</span> followers
              </div>
              <div className="flex flex-col md:flex-row gap-1 items-center">
                <span className="font-bold">{profile.followingCount}</span> following
              </div>
            </div>

            <div>
              <div className="font-bold mb-1">{profile.name}</div>
              <p className="text-muted-foreground">{profile.bio || 'No bio yet'}</p>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full justify-start border-b border-border bg-transparent p-0 rounded-none h-auto mb-6">
            <TabsTrigger
              value="posts"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary bg-transparent px-8 py-3 text-muted-foreground data-[state=active]:text-foreground"
            >
              <Grid size={20} className="mr-2" /> Posts
            </TabsTrigger>
            <TabsTrigger
              value="recipes"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary bg-transparent px-8 py-3 text-muted-foreground data-[state=active]:text-foreground"
            >
              <ChefHat size={20} className="mr-2" /> Recipes
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary bg-transparent px-8 py-3 text-muted-foreground data-[state=active]:text-foreground"
            >
              <Bookmark size={20} className="mr-2" /> Saved
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-3 gap-1 md:gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square" />
                ))}
              </div>
            ) : userPosts && userPosts.length > 0 ? (
              <div className="grid grid-cols-3 gap-1 md:gap-4">
                {userPosts.map((post) => (
                  <div key={post.$id} className="aspect-square bg-muted relative group cursor-pointer">
                    <img src={post.image} alt="" className="w-full h-full object-cover" />
                    {post.isRecipe && (
                      <div className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full">
                        <ChefHat size={12} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center flex flex-col items-center text-muted-foreground">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Grid size={32} className="opacity-50" />
                </div>
                <p className="font-medium">No posts yet</p>
                <p className="text-sm">Capture your first culinary moment.</p>
                <Link href="/create">
                  <Button variant="link" className="mt-2 text-primary">Create Post</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recipes">
            <div className="py-10 text-center text-muted-foreground">
              No separate recipes yet.
            </div>
          </TabsContent>

          <TabsContent value="saved">
            <div className="py-10 text-center text-muted-foreground">
              No saved items yet.
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
