import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    profileService,
    followService,
    likeService,
    commentService,
    type Profile,
    type Comment
} from '../lib/appwrite-services';

// ============================================================================
// Query Keys
// ============================================================================

export const profileKeys = {
    all: ['profiles'] as const,
    details: () => [...profileKeys.all, 'detail'] as const,
    detail: (userId: string) => [...profileKeys.details(), userId] as const,
    followers: (userId: string) => [...profileKeys.all, 'followers', userId] as const,
    following: (userId: string) => [...profileKeys.all, 'following', userId] as const,
};

// ============================================================================
// Profile Queries
// ============================================================================

/**
 * Get user profile by user ID
 */
export function useProfile(userId: string | undefined) {
    return useQuery({
        queryKey: profileKeys.detail(userId || ''),
        queryFn: () => profileService.getProfile(userId!),
        enabled: !!userId,
    });
}

/**
 * Get user profile by handle
 */
export function useProfileByHandle(handle: string | undefined) {
    return useQuery({
        queryKey: [...profileKeys.all, 'handle', handle],
        queryFn: () => profileService.getProfileByHandle(handle!),
        enabled: !!handle,
    });
}

/**
 * Get followers list
 */
export function useFollowers(userId: string | undefined) {
    return useQuery({
        queryKey: profileKeys.followers(userId || ''),
        queryFn: () => followService.getFollowers(userId!),
        enabled: !!userId,
    });
}

/**
 * Get following list
 */
export function useFollowing(userId: string | undefined) {
    return useQuery({
        queryKey: profileKeys.following(userId || ''),
        queryFn: () => followService.getFollowing(userId!),
        enabled: !!userId,
    });
}

// ============================================================================
// Profile Mutations
// ============================================================================

/**
 * Update user profile
 */
export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            documentId,
            data,
        }: {
            documentId: string;
            data: Partial<Pick<Profile, 'name' | 'handle' | 'avatar' | 'bio'>>;
        }) => profileService.updateProfile(documentId, data),
        onSuccess: (updatedProfile) => {
            // Update cache for this profile
            queryClient.setQueryData(
                profileKeys.detail(updatedProfile.userId),
                updatedProfile
            );
            queryClient.invalidateQueries({ queryKey: profileKeys.details() });
        },
    });
}

// ============================================================================
// Follow Queries & Mutations
// ============================================================================

/**
 * Check if current user is following another user
 */
export function useIsFollowing(followerId: string | undefined, followingId: string | undefined) {
    return useQuery({
        queryKey: ['follows', 'status', followerId, followingId],
        queryFn: () => followService.isFollowing(followerId!, followingId!),
        enabled: !!followerId && !!followingId && followerId !== followingId,
    });
}

/**
 * Follow/unfollow a user
 */
export function useFollowUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ followerId, followingId }: { followerId: string; followingId: string }) =>
            followService.toggleFollow(followerId, followingId),
        onMutate: async ({ followerId, followingId }) => {
            // Optimistic update
            const queryKey = ['follows', 'status', followerId, followingId];
            await queryClient.cancelQueries({ queryKey });

            const previousValue = queryClient.getQueryData(queryKey);
            queryClient.setQueryData(queryKey, (old: boolean) => !old);

            return { previousValue, queryKey };
        },
        onError: (_, __, context) => {
            // Revert optimistic update on error
            if (context) {
                queryClient.setQueryData(context.queryKey, context.previousValue);
            }
        },
        onSuccess: (_, { followerId, followingId }) => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: profileKeys.detail(followerId) });
            queryClient.invalidateQueries({ queryKey: profileKeys.detail(followingId) });
            queryClient.invalidateQueries({ queryKey: profileKeys.followers(followingId) });
            queryClient.invalidateQueries({ queryKey: profileKeys.following(followerId) });
        },
    });
}

// ============================================================================
// Like Queries & Mutations
// ============================================================================

/**
 * Check if user has liked a target
 */
export function useHasLiked(
    userId: string | undefined,
    targetType: 'post' | 'recipe' | 'comment',
    targetId: string | undefined
) {
    return useQuery({
        queryKey: ['likes', 'status', userId, targetType, targetId],
        queryFn: () => likeService.hasLiked(userId!, targetType, targetId!),
        enabled: !!userId && !!targetId,
    });
}

/**
 * Toggle like on a target (post, recipe, or comment)
 */
export function useToggleLike() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            userId,
            targetType,
            targetId,
        }: {
            userId: string;
            targetType: 'post' | 'recipe' | 'comment';
            targetId: string;
        }) => likeService.toggleLike(userId, targetType, targetId),
        onMutate: async ({ userId, targetType, targetId }) => {
            // Optimistic update for like status
            const queryKey = ['likes', 'status', userId, targetType, targetId];
            await queryClient.cancelQueries({ queryKey });

            const previousValue = queryClient.getQueryData(queryKey);
            queryClient.setQueryData(queryKey, (old: boolean) => !old);

            return { previousValue, queryKey };
        },
        onError: (_, __, context) => {
            // Revert on error
            if (context) {
                queryClient.setQueryData(context.queryKey, context.previousValue);
            }
        },
        onSuccess: (_, { targetType, targetId }) => {
            // Invalidate the target document to update like count
            if (targetType === 'post') {
                queryClient.invalidateQueries({ queryKey: ['posts', 'detail', targetId] });
            } else if (targetType === 'recipe') {
                queryClient.invalidateQueries({ queryKey: ['recipes', 'detail', targetId] });
            } else if (targetType === 'comment') {
                queryClient.invalidateQueries({ queryKey: ['comments', 'list'] });
            }
        },
    });
}

// ============================================================================
// Comment Queries & Mutations
// ============================================================================

/**
 * Get comments for a post
 */
export function useComments(postId: string | undefined) {
    return useQuery({
        queryKey: ['comments', 'list', postId],
        queryFn: () => commentService.listComments(postId!),
        enabled: !!postId,
    });
}

/**
 * Create a comment on a post
 */
export function useCreateComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { postId: string; userId: string; content: string }) =>
            commentService.createComment(data),
        onSuccess: (_, variables) => {
            // Refetch comments for this post
            queryClient.invalidateQueries({ queryKey: ['comments', 'list', variables.postId] });
            // Update post's comment count
            queryClient.invalidateQueries({ queryKey: ['posts', 'detail', variables.postId] });
        },
    });
}

/**
 * Delete a comment
 */
export function useDeleteComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ commentId, postId }: { commentId: string; postId: string }) =>
            commentService.deleteComment(commentId, postId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['comments', 'list', variables.postId] });
            queryClient.invalidateQueries({ queryKey: ['posts', 'detail', variables.postId] });
        },
    });
}
