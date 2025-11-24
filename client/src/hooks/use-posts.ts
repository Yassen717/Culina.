import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { postService, type Post } from '../lib/appwrite-services';

// ============================================================================
// Query Keys
// ============================================================================

export const postKeys = {
    all: ['posts'] as const,
    lists: () => [...postKeys.all, 'list'] as const,
    list: (filters: any) => [...postKeys.lists(), filters] as const,
    feed: (userId: string) => [...postKeys.all, 'feed', userId] as const,
    explore: () => [...postKeys.all, 'explore'] as const,
    details: () => [...postKeys.all, 'detail'] as const,
    detail: (id: string) => [...postKeys.details(), id] as const,
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Fetch a single post by ID
 */
export function usePost(postId: string | undefined) {
    return useQuery({
        queryKey: postKeys.detail(postId || ''),
        queryFn: () => postService.getPost(postId!),
        enabled: !!postId,
    });
}

/**
 * List posts with filters
 */
export function usePosts(options?: {
    userId?: string;
    isRecipe?: boolean;
    limit?: number;
}) {
    return useQuery({
        queryKey: postKeys.list(options || {}),
        queryFn: () => postService.listPosts(options),
    });
}

/**
 * Infinite scroll feed for followed users
 */
export function useFeed(followingIds: string[]) {
    const limit = 10;

    return useInfiniteQuery({
        queryKey: postKeys.feed(followingIds.join(',')),
        queryFn: ({ pageParam }) =>
            postService.listPosts({
                followingIds,
                limit,
                offset: pageParam * limit,
            }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < limit) return undefined;
            return allPages.length;
        },
        enabled: followingIds.length > 0,
    });
}

/**
 * Infinite scroll for explore feed (all posts)
 */
export function useExplorePosts() {
    const limit = 20;

    return useInfiniteQuery({
        queryKey: postKeys.explore(),
        queryFn: ({ pageParam }) =>
            postService.listPosts({
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

/**
 * Get user's posts (for profile page)
 */
export function useUserPosts(userId: string | undefined) {
    return useQuery({
        queryKey: postKeys.list({ userId }),
        queryFn: () => postService.listPosts({ userId, limit: 50 }),
        enabled: !!userId,
    });
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new post
 */
export function useCreatePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: {
            userId: string;
            image: string;
            caption: string;
            location?: string;
            isRecipe?: boolean;
            recipeId?: string;
            tags?: string[];
        }) => postService.createPost(data),
        onSuccess: () => {
            // Invalidate all post lists
            queryClient.invalidateQueries({ queryKey: postKeys.lists() });
            queryClient.invalidateQueries({ queryKey: postKeys.explore() });
        },
    });
}

/**
 * Update a post
 */
export function useUpdatePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            postId,
            data,
        }: {
            postId: string;
            data: Partial<Pick<Post, 'caption' | 'location' | 'tags'>>;
        }) => postService.updatePost(postId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: postKeys.detail(variables.postId) });
            queryClient.invalidateQueries({ queryKey: postKeys.lists() });
        },
    });
}

/**
 * Delete a post
 */
export function useDeletePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, userId }: { postId: string; userId: string }) =>
            postService.deletePost(postId, userId),
        onSuccess: (_, variables) => {
            queryClient.removeQueries({ queryKey: postKeys.detail(variables.postId) });
            queryClient.invalidateQueries({ queryKey: postKeys.lists() });
            queryClient.invalidateQueries({ queryKey: postKeys.explore() });
        },
    });
}
