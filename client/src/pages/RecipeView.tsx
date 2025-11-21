import { useRoute, Link } from 'wouter';
import { MOCK_RECIPES, MOCK_POSTS, MOCK_USERS } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Flame, BarChart, CheckCircle2, Share2, Printer } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';

export default function RecipeView() {
  const [match, params] = useRoute('/recipe/:id');
  const recipe = params?.id ? MOCK_RECIPES[params.id] : null;
  
  if (!recipe) return <div className="p-8 text-center">Recipe not found</div>;

  // Find the post associated with this recipe to get the image
  const post = MOCK_POSTS.find(p => p.recipeId === recipe.id);
  const user = post ? MOCK_USERS[post.userId] : null;

  return (
    <div className="bg-background min-h-screen pb-20 md:pb-0">
      {/* Header Image Section */}
      <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
        <img 
          src={post?.image} 
          alt={recipe.title} 
          className="w-full h-full object-cover"
        />
        
        <div className="absolute top-4 left-4 z-20">
          <Link href="/">
            <Button variant="secondary" size="icon" className="rounded-full bg-background/20 backdrop-blur-md hover:bg-background/40 text-white border-none">
              <ArrowLeft size={20} />
            </Button>
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-20 text-white">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <Badge className="bg-primary text-white hover:bg-primary mb-3 border-none">
              {recipe.difficulty}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-serif font-bold mb-2 leading-tight">
              {recipe.title}
            </h1>
            {user && (
              <div className="flex items-center gap-2 text-white/90 text-sm md:text-base">
                <span>by {user.name}</span>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto -mt-8 relative z-30 px-4 md:px-0">
        <div className="bg-card rounded-t-3xl md:rounded-xl border border-border shadow-xl p-6 md:p-10 mb-10">
          
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 mb-8 border-b border-border pb-8">
            <div className="flex flex-col items-center justify-center gap-1 text-center">
              <Clock className="text-primary mb-1" size={24} />
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Time</span>
              <span className="font-medium text-lg">{recipe.prepTime + recipe.cookTime} min</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 text-center border-l border-r border-border">
              <Flame className="text-orange-500 mb-1" size={24} />
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Calories</span>
              <span className="font-medium text-lg">{recipe.calories}</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 text-center">
              <BarChart className="text-blue-500 mb-1" size={24} />
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Difficulty</span>
              <span className="font-medium text-lg">{recipe.difficulty}</span>
            </div>
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed mb-10 italic font-serif border-l-4 border-primary pl-4">
            "{recipe.description}"
          </p>

          <div className="grid md:grid-cols-[1fr_1.5fr] gap-10">
            {/* Ingredients */}
            <div>
              <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
                Ingredients
              </h2>
              <ul className="space-y-4">
                {recipe.ingredients.map((ingredient, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <Checkbox id={`ing-${i}`} className="mt-1" />
                    <label 
                      htmlFor={`ing-${i}`}
                      className="text-base leading-tight cursor-pointer select-none peer-data-[state=checked]:text-muted-foreground peer-data-[state=checked]:line-through"
                    >
                      {ingredient}
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* Steps */}
            <div>
              <h2 className="text-2xl font-serif font-bold mb-6">Instructions</h2>
              <div className="space-y-8 relative">
                <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-border/50" />
                
                {recipe.steps.map((step, i) => (
                  <div key={i} className="relative pl-10">
                    <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-card border-2 border-primary text-primary font-bold flex items-center justify-center text-sm z-10">
                      {step.order}
                    </div>
                    <div className="pt-1">
                      <p className="text-lg leading-relaxed text-foreground/90">
                        {step.instruction}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions Footer */}
          <div className="mt-12 pt-8 border-t border-border flex justify-end gap-3">
            <Button variant="outline" size="lg" className="gap-2">
              <Share2 size={18} /> Share
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Printer size={18} /> Print
            </Button>
            <Button size="lg" className="gap-2 text-white bg-primary hover:bg-primary/90">
              <CheckCircle2 size={18} /> Mark Cooked
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
