import { MOCK_POSTS, MOCK_USERS } from '@/lib/data';
import { FoodPost } from '@/components/FoodPost';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
  const stories = Object.values(MOCK_USERS);

  return (
    <div className="flex flex-col max-w-xl mx-auto pb-20 pt-4 md:pt-8 px-0 md:px-4">
      {/* Stories Bar */}
      <div className="mb-6 px-4 md:px-0">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-4 pb-2">
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-16 h-16 rounded-full bg-muted border-2 border-dashed border-muted-foreground/50 flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
                <span className="text-2xl">+</span>
              </div>
              <span className="text-xs font-medium">Add Story</span>
            </div>
            {stories.map((user) => (
              <div key={user.id} className="flex flex-col items-center gap-1.5 cursor-pointer group">
                <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-primary to-orange-300 group-hover:scale-105 transition-transform">
                  <div className="w-full h-full rounded-full border-2 border-background overflow-hidden">
                    <img src={user.avatar} alt={user.handle} className="w-full h-full object-cover" />
                  </div>
                </div>
                <span className="text-xs font-medium">{user.handle.replace('@', '')}</span>
              </div>
            ))}
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
          <div className="flex flex-col gap-0 md:gap-4">
            {MOCK_POSTS.map((post) => (
              <FoodPost key={post.id} post={post} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="following">
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
            <p>Follow people to see their posts here!</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
