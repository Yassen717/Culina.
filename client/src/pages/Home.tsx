import { FoodPost } from '@/components/FoodPost';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useExplorePosts } from '@/hooks/use-posts';
import { useFollowing } from '@/hooks/use-social';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { ChefHat, Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

// Loading skeleton for feed
function LoadingFeed() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-3">
          <div className="flex items-center gap-3 px-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-96 w-full rounded-none md:rounded-lg" />
          <div className="px-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get users the current user is following
  const { data: followingUserIds = [] } = useFollowing(user?.id);

  // Explore feed (all posts) with infinite scroll
  const {
    data: explorePosts,
    isLoading: exploreLoading,
    isError: exploreError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useExplorePosts();

  const allExplorePosts = explorePosts?.pages.flatMap(page => page) || [];

  // For now, filter following posts on the client side from explore posts
  // In production, you'd want a server-side filter or separate hook
  const followingPosts = allExplorePosts.filter(post =>
    followingUserIds.includes(post.userId)
  );

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current || !hasNextPage || isFetchingNextPage) return;

      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      if (scrollHeight - scrollTop <= clientHeight * 1.5) {
        fetchNextPage();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="flex flex-col max-w-xl mx-auto pb-20 pt-4 md:pt-8 px-0 md:px-4" ref={scrollRef}>
      {/* Stories Bar - Simplified for now, can be expanded later */}
      <div className="mb-6 px-4 md:px-0">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-4 pb-2">
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-16 h-16 rounded-full bg-muted border-2 border-dashed border-muted-foreground/50 flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
                <span className="text-2xl">+</span>
              </div>
              <span className="text-xs font-medium">Add Story</span>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Feeds */}
      <Tabs defaultValue="for-you" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-transparent h-auto p-0 border-b border-border rounded-none">
          <TabsTrigger
            value="for-you"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none bg-transparent py-3 text-base font-serif font-medium text-muted-foreground data-[state=active]:text-foreground transition-all"
          >
            For You
          </TabsTrigger>
          <TabsTrigger
            value="following"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none bg-transparent py-3 text-base font-serif font-medium text-muted-foreground data-[state=active]:text-foreground transition-all"
          >
            Following
          </TabsTrigger>
        </TabsList>

        <TabsContent value="for-you" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {exploreLoading ? (
            <LoadingFeed />
          ) : exploreError ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <ChefHat className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Unable to load feed</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Please check your connection and try again
              </p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Retry
              </Button>
            </div>
          ) : allExplorePosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <ChefHat className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Be the first to share your culinary creations!
              </p>
              <Button onClick={() => window.location.href = '/create'}>
                Create Post
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-0 md:gap-4">
                {allExplorePosts.map((post) => (
                  <FoodPost key={post.$id} post={post} />
                ))}
              </div>
              {isFetchingNextPage && (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
              {!hasNextPage && allExplorePosts.length > 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">
                  You've reached the end! 🎉
                </p>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="following">
          {followingUserIds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <ChefHat className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No one followed yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Discover amazing food creators in the Explore tab
              </p>
              <Button onClick={() => window.location.href = '/explore'} variant="outline">
                Explore
              </Button>
            </div>
          ) : followingPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
              <p>No posts from people you follow yet.</p>
              <p className="text-sm mt-2">Check back later!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-0 md:gap-4">
              {followingPosts.map((post) => (
                <FoodPost key={post.$id} post={post} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
