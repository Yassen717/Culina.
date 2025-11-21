import { MOCK_USERS, MOCK_POSTS } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heart, MessageCircle, UserPlus, ChefHat } from 'lucide-react';
import { Link } from 'wouter';

type ActivityType = 'like' | 'comment' | 'follow' | 'recipe_save';

interface ActivityItem {
  id: string;
  type: ActivityType;
  userId: string;
  postId?: string;
  time: string;
  read: boolean;
  content?: string;
}

const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: '1',
    type: 'like',
    userId: 'user2',
    postId: 'post1',
    time: '2m ago',
    read: false
  },
  {
    id: '2',
    type: 'comment',
    userId: 'user3',
    postId: 'post1',
    time: '1h ago',
    read: false,
    content: 'This looks absolutely delicious! Do you have a substitution for the truffles?'
  },
  {
    id: '3',
    type: 'follow',
    userId: 'user2',
    time: '3h ago',
    read: true
  },
  {
    id: '4',
    type: 'recipe_save',
    userId: 'user3',
    postId: 'post1',
    time: '5h ago',
    read: true
  },
  {
    id: '5',
    type: 'like',
    userId: 'user3',
    postId: 'post3',
    time: '1d ago',
    read: true
  }
];

export default function Activity() {
  return (
    <div className="pb-20 md:pb-0 max-w-2xl mx-auto">
      <div className="p-6 border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <h1 className="text-2xl font-serif font-bold">Activity</h1>
      </div>

      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="p-4">
          <div className="space-y-6">
            {/* New */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-4 pl-2">New</h3>
              <div className="space-y-1">
                {MOCK_ACTIVITY.filter(a => !a.read).map(activity => (
                  <ActivityRow key={activity.id} activity={activity} />
                ))}
              </div>
            </div>

            {/* Earlier */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-4 pl-2">Earlier</h3>
              <div className="space-y-1">
                {MOCK_ACTIVITY.filter(a => a.read).map(activity => (
                  <ActivityRow key={activity.id} activity={activity} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

function ActivityRow({ activity }: { activity: ActivityItem }) {
  const user = MOCK_USERS[activity.userId];
  const post = activity.postId ? MOCK_POSTS.find(p => p.id === activity.postId) : null;

  return (
    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group">
      <div className="relative">
        <Avatar className="w-12 h-12 border border-border">
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 shadow-sm">
          {activity.type === 'like' && <div className="bg-red-500 rounded-full p-1"><Heart size={10} className="text-white fill-white" /></div>}
          {activity.type === 'comment' && <div className="bg-blue-500 rounded-full p-1"><MessageCircle size={10} className="text-white fill-white" /></div>}
          {activity.type === 'follow' && <div className="bg-purple-500 rounded-full p-1"><UserPlus size={10} className="text-white fill-white" /></div>}
          {activity.type === 'recipe_save' && <div className="bg-green-500 rounded-full p-1"><ChefHat size={10} className="text-white fill-white" /></div>}
        </div>
      </div>

      <div className="flex-1 text-sm">
        <span className="font-semibold mr-1">{user.handle}</span>
        <span className="text-muted-foreground">
          {activity.type === 'like' && 'liked your post.'}
          {activity.type === 'comment' && `commented: "${activity.content}"`}
          {activity.type === 'follow' && 'started following you.'}
          {activity.type === 'recipe_save' && 'saved your recipe.'}
        </span>
        <div className="text-xs text-muted-foreground mt-0.5">{activity.time}</div>
      </div>

      {post && (
        <Link href={`/recipe/${post.recipeId}`}>
          <div className="w-12 h-12 rounded-md overflow-hidden shrink-0 border border-border">
            <img src={post.image} alt="" className="w-full h-full object-cover" />
          </div>
        </Link>
      )}

      {activity.type === 'follow' && (
        <Button size="sm" variant="outline" className="h-8">
          Follow Back
        </Button>
      )}
    </div>
  );
}
