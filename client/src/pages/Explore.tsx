import { motion } from 'framer-motion';
import { Search, ChefHat } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useExplorePosts } from '@/hooks/use-posts';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function Explore() {
  const { data: posts, isLoading, isError } = useExplorePosts();

  const allPosts = posts?.pages.flatMap(page => page) || [];

  return (
    <div className="pb-20 md:pb-0">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md p-4 border-b border-border">
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search recipes, chefs, ingredients..."
            className="pl-9 bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary transition-all"
          />
        </div>
      </div>

      <div className="p-4 max-w-6xl mx-auto">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-1 md:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-md" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <ChefHat className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Unable to load explore feed</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Please check your connection and try again
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </div>
        ) : allPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <ChefHat className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No posts to explore yet</h3>
            <p className="text-sm text-muted-foreground">
              Be the first to share your culinary creations!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 md:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {allPosts.map((post, i) => (
              <motion.div
                key={post.$id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02 }}
                className="relative aspect-square group cursor-pointer overflow-hidden rounded-md bg-muted"
              >
                <img
                  src={post.image}
                  alt="Explore content"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold">
                  {post.likesCount} ❤️
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
