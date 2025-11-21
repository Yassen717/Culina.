import { MOCK_POSTS } from '@/lib/data';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Explore() {
  // Duplicate posts to fill the grid for demo purposes
  const gridPosts = [...MOCK_POSTS, ...MOCK_POSTS, ...MOCK_POSTS].sort(() => Math.random() - 0.5);

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
        <div className="grid grid-cols-3 gap-1 md:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {gridPosts.map((post, i) => (
            <motion.div 
              key={`${post.id}-${i}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="relative aspect-square group cursor-pointer overflow-hidden rounded-md bg-muted"
            >
              <img 
                src={post.image} 
                alt="Explore content" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold">
                {post.likes} ❤️
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
