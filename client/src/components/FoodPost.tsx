import { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Send, Bookmark, ChefHat, MapPin, MoreHorizontal } from 'lucide-react';
import { Post } from '@/lib/appwrite-services';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/use-social';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from 'date-fns';

interface FoodPostProps {
  post: Post;
}

export function FoodPost({ post }: FoodPostProps) {
  const { data: profile } = useProfile(post.userId);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount);

  const handleLike = () => {
    if (isLiked) {
      setLikesCount(prev => prev - 1);
    } else {
      setLikesCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
  };

  // Show loading placeholder if profile hasn't loaded yet
  if (!profile) {
    return (
      <div className="bg-card border-b border-border md:border md:rounded-xl overflow-hidden mb-6 md:mb-8 shadow-sm animate-pulse">
        <div className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 rounded-full bg-muted" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
        <div className="aspect-[4/3] w-full bg-muted" />
        <div className="p-4 space-y-2">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border-b border-border md:border md:rounded-xl overflow-hidden mb-6 md:mb-8 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border border-border">
            <AvatarImage src={profile.avatar} alt={profile.handle} />
            <AvatarFallback>{profile.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-sm leading-none hover:underline cursor-pointer">
              {profile.name}
            </span>
            {post.location && (
              <span className="text-xs text-muted-foreground flex items-center gap-0.5 mt-1">
                <MapPin size={10} /> {post.location}
              </span>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Report</DropdownMenuItem>
            <DropdownMenuItem>Unfollow</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Image */}
      <div className="relative aspect-[4/3] w-full bg-muted overflow-hidden group cursor-pointer">
        <img
          src={post.image}
          alt="Food post"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {post.isRecipe && (
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg animate-in fade-in">
            <ChefHat size={12} />
            <span>Recipe</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={cn(
                "transition-all duration-200 hover:scale-110 active:scale-95",
                isLiked ? "text-red-500 fill-red-500" : "text-foreground hover:text-red-500"
              )}
            >
              <Heart size={24} className={cn(isLiked && "fill-current")} />
            </button>
            <button className="text-foreground hover:text-primary transition-colors hover:scale-110 active:scale-95">
              <MessageCircle size={24} />
            </button>
            <button className="text-foreground hover:text-primary transition-colors hover:scale-110 active:scale-95">
              <Send size={24} />
            </button>
          </div>
          <button
            onClick={() => setIsSaved(!isSaved)}
            className={cn(
              "transition-all duration-200 hover:scale-110 active:scale-95",
              isSaved ? "text-primary fill-primary" : "text-foreground hover:text-primary"
            )}
          >
            <Bookmark size={24} className={cn(isSaved && "fill-current")} />
          </button>
        </div>

        <div className="font-semibold text-sm mb-2">
          {likesCount.toLocaleString()} likes
        </div>

        <div className="text-sm mb-2">
          <span className="font-semibold mr-2">{profile.handle}</span>
          {post.caption}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs text-primary cursor-pointer hover:underline">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {post.isRecipe && post.recipeId && (
          <Link href={`/recipe/${post.recipeId}`}>
            <Button
              variant="outline"
              className="w-full mt-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors group"
            >
              <ChefHat size={16} className="mr-2 group-hover:rotate-12 transition-transform" />
              View Recipe Card
            </Button>
          </Link>
        )}

        <div className="text-xs text-muted-foreground mt-3 uppercase tracking-wide">
          {formatDistanceToNow(new Date(post.$createdAt), { addSuffix: true })}
        </div>
      </div>
    </motion.article>
  );
}
