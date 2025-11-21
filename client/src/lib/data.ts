import gourmetPasta from '@assets/generated_images/gourmet_truffle_pasta_dish_overhead_shot.png';
import sourdoughPizza from '@assets/generated_images/artisan_sourdough_pizza_with_burrata.png';
import smoothieBowl from '@assets/generated_images/colorful_berry_smoothie_bowl.png';
import sushiPlatter from '@assets/generated_images/elegant_sushi_platter.png';
import lavaCake from '@assets/generated_images/decadent_chocolate_lava_cake.png';

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
}

export interface RecipeStep {
  order: number;
  instruction: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  steps: RecipeStep[];
  prepTime: number; // minutes
  cookTime: number; // minutes
  difficulty: 'Easy' | 'Medium' | 'Hard';
  calories?: number;
}

export interface Post {
  id: string;
  userId: string;
  image: string;
  caption: string;
  location?: string;
  likes: number;
  comments: number;
  isRecipe: boolean;
  recipeId?: string;
  createdAt: string;
  tags: string[];
}

export const MOCK_USERS: Record<string, User> = {
  'user1': {
    id: 'user1',
    name: 'Elena Romano',
    handle: '@elena.eats',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces',
    bio: 'Italian chef living in NYC 🍝',
    followers: 12500,
    following: 450,
  },
  'user2': {
    id: 'user2',
    name: 'Marcus Chen',
    handle: '@marcus_kitchen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces',
    bio: 'Fusion cuisine enthusiast | Home cook',
    followers: 8900,
    following: 320,
  },
  'user3': {
    id: 'user3',
    name: 'Sarah Jenkins',
    handle: '@sarahbakes',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=faces',
    bio: 'Pastry lover 🍰 Sourdough whisperer',
    followers: 24000,
    following: 120,
  }
};

export const MOCK_RECIPES: Record<string, Recipe> = {
  'recipe1': {
    id: 'recipe1',
    title: 'Truffle Cream Pasta',
    description: 'A decadent yet simple pasta dish featuring fresh black truffles and a rich parmesan cream sauce.',
    ingredients: [
      '400g Tagliatelle pasta',
      '1 Black Truffle (fresh or preserved)',
      '200ml Heavy Cream',
      '100g Parmigiano Reggiano, grated',
      '2 tbsp Butter',
      'Salt & Black Pepper to taste'
    ],
    steps: [
      { order: 1, instruction: 'Bring a large pot of salted water to a boil.' },
      { order: 2, instruction: 'In a large skillet, melt butter over medium heat. Add cream and simmer gently for 5 minutes.' },
      { order: 3, instruction: 'Cook pasta until al dente. Reserve 1/2 cup of pasta water.' },
      { order: 4, instruction: 'Add cooked pasta to the skillet with the cream sauce. Toss to coat, adding pasta water if needed to loosen.' },
      { order: 5, instruction: 'Remove from heat. Stir in grated parmesan and shave fresh truffle on top before serving.' }
    ],
    prepTime: 10,
    cookTime: 15,
    difficulty: 'Medium',
    calories: 650
  },
  'recipe2': {
    id: 'recipe2',
    title: 'Artisan Sourdough Pizza',
    description: 'Homemade sourdough crust topped with creamy burrata, sweet cherry tomatoes, and fresh basil.',
    ingredients: [
      '1 ball Sourdough Pizza Dough',
      '1/2 cup San Marzano Tomato Sauce',
      '1 ball Fresh Burrata Cheese',
      '1 cup Cherry Tomatoes, halved',
      'Fresh Basil leaves',
      'Extra Virgin Olive Oil'
    ],
    steps: [
      { order: 1, instruction: 'Preheat oven to max temperature (500°F/260°C) with a pizza stone inside.' },
      { order: 2, instruction: 'Stretch dough into a 12-inch circle. Spread tomato sauce evenly.' },
      { order: 3, instruction: 'Top with cherry tomatoes and a drizzle of olive oil.' },
      { order: 4, instruction: 'Bake for 8-10 minutes until crust is blistered and golden.' },
      { order: 5, instruction: 'Remove from oven. Top with fresh burrata (torn) and basil leaves immediately.' }
    ],
    prepTime: 20,
    cookTime: 10,
    difficulty: 'Hard',
    calories: 800
  }
};

export const MOCK_POSTS: Post[] = [
  {
    id: 'post1',
    userId: 'user1',
    image: gourmetPasta,
    caption: 'Sunday night calls for something special. Homemade truffle tagliatelle. The aroma is incredible! 🍝✨',
    location: 'West Village, NYC',
    likes: 1243,
    comments: 89,
    isRecipe: true,
    recipeId: 'recipe1',
    createdAt: '2h ago',
    tags: ['italian', 'pasta', 'truffle', 'homemade']
  },
  {
    id: 'post2',
    userId: 'user3',
    image: sourdoughPizza,
    caption: 'Finally perfected my sourdough crust hydration! 75% hydration, 48h fermentation. Topped with fresh burrata. 🍕🌿',
    location: 'San Francisco, CA',
    likes: 3402,
    comments: 210,
    isRecipe: true,
    recipeId: 'recipe2',
    createdAt: '5h ago',
    tags: ['pizza', 'sourdough', 'baking', 'weekend']
  },
  {
    id: 'post3',
    userId: 'user2',
    image: sushiPlatter,
    caption: 'Omakase night at the new spot downtown. The toro was melting in my mouth. 🍣',
    location: 'Sushi Nakazawa',
    likes: 892,
    comments: 45,
    isRecipe: false,
    createdAt: '1d ago',
    tags: ['sushi', 'japanesefood', 'omakase', 'dinner']
  },
  {
    id: 'post4',
    userId: 'user3',
    image: smoothieBowl,
    caption: 'Start your morning right. Acai base with hemp seeds, dragon fruit, and homemade granola. 🫐🥥',
    likes: 2100,
    comments: 120,
    isRecipe: false,
    createdAt: '2d ago',
    tags: ['healthy', 'breakfast', 'smoothiebowl', 'vegan']
  },
  {
    id: 'post5',
    userId: 'user1',
    image: lavaCake,
    caption: 'Sometimes you just need chocolate. Molten lava cake test run for the fall menu. 🍫',
    likes: 5600,
    comments: 430,
    isRecipe: false, // Could be a recipe but let's keep it image only for variety
    createdAt: '3d ago',
    tags: ['dessert', 'chocolate', 'baking', 'sweet']
  }
];
