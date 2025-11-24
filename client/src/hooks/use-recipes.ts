import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { recipeService, type Recipe, type RecipeStep } from '../lib/appwrite-services';

// ============================================================================
// Query Keys
// ============================================================================

export const recipeKeys = {
    all: ['recipes'] as const,
    lists: () => [...recipeKeys.all, 'list'] as const,
    list: (filters: any) => [...recipeKeys.lists(), filters] as const,
    details: () => [...recipeKeys.all, 'detail'] as const,
    detail: (id: string) => [...recipeKeys.details(), id] as const,
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Fetch a single recipe by ID
 */
export function useRecipe(recipeId: string | undefined) {
    return useQuery({
        queryKey: recipeKeys.detail(recipeId || ''),
        queryFn: () => recipeService.getRecipe(recipeId!),
        enabled: !!recipeId,
    });
}

/**
 * List recipes with optional filters
 */
export function useRecipes(options?: {
    authorId?: string;
    difficulty?: string;
    limit?: number;
}) {
    return useQuery({
        queryKey: recipeKeys.list(options || {}),
        queryFn: () => recipeService.listRecipes(options),
    });
}

/**
 * Infinite scroll for recipes
 */
export function useInfiniteRecipes(options?: {
    authorId?: string;
    difficulty?: string;
}) {
    const limit = 10;

    return useInfiniteQuery({
        queryKey: recipeKeys.list({ ...options, infinite: true }),
        queryFn: ({ pageParam }) =>
            recipeService.listRecipes({
                ...options,
                limit,
                offset: pageParam * limit,
            }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < limit) return undefined;
            return allPages.length;
        },
    });
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new recipe
 */
export function useCreateRecipe() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: {
            authorId: string;
            title: string;
            description: string;
            image?: string;
            ingredients: string[];
            steps: RecipeStep[];
            prepTime: number;
            cookTime: number;
            difficulty: 'Easy' | 'Medium' | 'Hard';
            calories?: number;
            servings?: number;
            tags?: string[];
        }) => recipeService.createRecipe(data),
        onSuccess: () => {
            // Invalidate recipe lists to refetch
            queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
        },
    });
}

/**
 * Update an existing recipe
 */
export function useUpdateRecipe() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            recipeId,
            data,
        }: {
            recipeId: string;
            data: Partial<Omit<Recipe, '$id' | '$createdAt' | '$updatedAt' | 'authorId' | 'likesCount'>>;
        }) => recipeService.updateRecipe(recipeId, data),
        onSuccess: (_, variables) => {
            // Invalidate the specific recipe and all lists
            queryClient.invalidateQueries({ queryKey: recipeKeys.detail(variables.recipeId) });
            queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
        },
    });
}

/**
 * Delete a recipe
 */
export function useDeleteRecipe() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ recipeId, authorId }: { recipeId: string; authorId: string }) =>
            recipeService.deleteRecipe(recipeId, authorId),
        onSuccess: (_, variables) => {
            // Remove from cache and invalidate lists
            queryClient.removeQueries({ queryKey: recipeKeys.detail(variables.recipeId) });
            queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
        },
    });
}
