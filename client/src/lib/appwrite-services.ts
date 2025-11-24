import { ID, Query, type Models } from 'appwrite';
import { databases, storage, account, APPWRITE_CONFIG } from './appwrite';

// ============================================================================
// Type Definitions
// ============================================================================

export interface Profile extends Models.Document {
    userId: string;
    name: string;
    handle: string;
    avatar?: string;
    bio?: string;
    followersCount: number;
    followingCount: number;
    postsCount: number;
    recipesCount: number;
}

export interface RecipeStep {
    order: number;
    instruction: string;
}

export interface Recipe extends Models.Document {
    authorId: string;
    title: string;
    description: string;
    image?: string;
    ingredients: string[];
    steps: string[]; // JSON stringified RecipeStep[]
    prepTime: number;
    cookTime: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    calories?: number;
    servings?: number;
    tags?: string[];
    likesCount: number;
}

export interface Post extends Models.Document {
    userId: string;
    image: string;
    caption: string;
    location?: string;
    isRecipe: boolean;
    recipeId?: string;
    tags?: string[];
    likesCount: number;
    commentsCount: number;
}

export interface Comment extends Models.Document {
    postId: string;
    userId: string;
    content: string;
    likesCount: number;
}

export interface Like extends Models.Document {
    userId: string;
    targetType: 'post' | 'recipe' | 'comment';
    targetId: string;
}

export interface Follow extends Models.Document {
    followerId: string;
    followingId: string;
}

// ============================================================================
// Profile Service
// ============================================================================

export const profileService = {
    /**
     * Get a user profile by user ID
     */
    async getProfile(userId: string): Promise<Profile | null> {
        try {
            const result = await databases.listDocuments<Profile>(
                APPWRITE_CONFIG.DATABASE_ID,
                APPWRITE_CONFIG.COLLECTION_ID_PROFILES,
                [Query.equal('userId', userId), Query.limit(1)]
            );
            return result.documents[0] || null;
        } catch (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
    },

    /**
     * Get a user profile by handle
     */
    async getProfileByHandle(handle: string): Promise<Profile | null> {
        try {
            const result = await databases.listDocuments<Profile>(
                APPWRITE_CONFIG.DATABASE_ID,
                APPWRITE_CONFIG.COLLECTION_ID_PROFILES,
                [Query.equal('handle', handle), Query.limit(1)]
            );
            return result.documents[0] || null;
        } catch (error) {
            console.error('Error fetching profile by handle:', error);
            return null;
        }
    },

    /**
     * Create a new profile (called during registration)
     */
    async createProfile(data: {
        userId: string;
        name: string;
        handle: string;
        avatar?: string;
        bio?: string;
    }): Promise<Profile> {
        return await databases.createDocument<Profile>(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_ID_PROFILES,
            ID.unique(),
            {
                ...data,
                followersCount: 0,
                followingCount: 0,
                postsCount: 0,
                recipesCount: 0,
            }
        );
    },

    /**
     * Update profile information
     */
    async updateProfile(
        documentId: string,
        data: Partial<Pick<Profile, 'name' | 'handle' | 'avatar' | 'bio'>>
    ): Promise<Profile> {
        return await databases.updateDocument<Profile>(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_ID_PROFILES,
            documentId,
            data
        );
    },

    /**
     * Increment profile counters
     */
    async incrementCounter(
        documentId: string,
        field: 'followersCount' | 'followingCount' | 'postsCount' | 'recipesCount',
        increment: number = 1
    ): Promise<void> {
        try {
            const profile = await databases.getDocument<Profile>(
                APPWRITE_CONFIG.DATABASE_ID,
                APPWRITE_CONFIG.COLLECTION_ID_PROFILES,
                documentId
            );

            await databases.updateDocument(
                APPWRITE_CONFIG.DATABASE_ID,
                APPWRITE_CONFIG.COLLECTION_ID_PROFILES,
                documentId,
                { [field]: profile[field] + increment }
            );
        } catch (error) {
            console.error('Error incrementing counter:', error);
        }
    },
};

// ============================================================================
// Recipe Service
// ============================================================================

export const recipeService = {
    /**
     * Get a single recipe by ID
     */
    async getRecipe(recipeId: string): Promise<Recipe | null> {
        try {
            return await databases.getDocument<Recipe>(
                APPWRITE_CONFIG.DATABASE_ID,
                APPWRITE_CONFIG.COLLECTION_ID_RECIPES,
                recipeId
            );
        } catch (error) {
            console.error('Error fetching recipe:', error);
            return null;
        }
    },

    /**
     * List recipes with optional filters
     */
    async listRecipes(options?: {
        authorId?: string;
        difficulty?: string;
        limit?: number;
        offset?: number;
        orderBy?: string;
    }): Promise<Recipe[]> {
        const queries: string[] = [];

        if (options?.authorId) {
            queries.push(Query.equal('authorId', options.authorId));
        }
        if (options?.difficulty) {
            queries.push(Query.equal('difficulty', options.difficulty));
        }
        if (options?.limit) {
            queries.push(Query.limit(options.limit));
        }
        if (options?.offset) {
            queries.push(Query.offset(options.offset));
        }

        // Default: order by creation date descending
        queries.push(Query.orderDesc('$createdAt'));

        try {
            const result = await databases.listDocuments<Recipe>(
                APPWRITE_CONFIG.DATABASE_ID,
                APPWRITE_CONFIG.COLLECTION_ID_RECIPES,
                queries
            );
            return result.documents;
        } catch (error) {
            console.error('Error listing recipes:', error);
            return [];
        }
    },

    /**
     * Create a new recipe
     */
    async createRecipe(data: {
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
    }): Promise<Recipe> {
        const recipe = await databases.createDocument<Recipe>(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_ID_RECIPES,
            ID.unique(),
            {
                ...data,
                steps: data.steps.map((step) => JSON.stringify(step)),
                likesCount: 0,
            }
        );

        // Increment author's recipe count
        const profile = await profileService.getProfile(data.authorId);
        if (profile) {
            await profileService.incrementCounter(profile.$id, 'recipesCount', 1);
        }

        return recipe;
    },

    /**
     * Update a recipe
     */
    async updateRecipe(
        recipeId: string,
        data: Partial<Omit<Recipe, '$id' | '$createdAt' | '$updatedAt' | 'authorId' | 'likesCount'>>
    ): Promise<Recipe> {
        const updateData: any = { ...data };

        // Stringify steps if provided
        if (data.steps) {
            updateData.steps = data.steps.map((step: any) =>
                typeof step === 'string' ? step : JSON.stringify(step)
            );
        }

        return await databases.updateDocument<Recipe>(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_ID_RECIPES,
            recipeId,
            updateData
        );
    },

    /**
     * Delete a recipe
     */
    async deleteRecipe(recipeId: string, authorId: string): Promise<void> {
        await databases.deleteDocument(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_ID_RECIPES,
            recipeId
        );

        // Decrement author's recipe count
        const profile = await profileService.getProfile(authorId);
        if (profile) {
            await profileService.incrementCounter(profile.$id, 'recipesCount', -1);
        }
    },

    /**
     * Parse recipe steps from JSON strings
     */
    parseSteps(steps: string[]): RecipeStep[] {
        return steps.map((step) => {
            try {
                return JSON.parse(step);
            } catch {
                // Fallback for plain strings
                return { order: 0, instruction: step };
            }
        });
    },
};

// ============================================================================
// Post Service
// ============================================================================

export const postService = {
    /**
     * Get a single post by ID
     */
    async getPost(postId: string): Promise<Post | null> {
        try {
            return await databases.getDocument<Post>(
                APPWRITE_CONFIG.DATABASE_ID,
                APPWRITE_CONFIG.COLLECTION_ID_POSTS,
                postId
            );
        } catch (error) {
            console.error('Error fetching post:', error);
            return null;
        }
    },

    /**
     * List posts (feed or explore)
     */
    async listPosts(options?: {
        userId?: string;
        isRecipe?: boolean;
        limit?: number;
        offset?: number;
        followingIds?: string[]; // For feed of followed users
    }): Promise<Post[]> {
        const queries: string[] = [];

        if (options?.userId) {
            queries.push(Query.equal('userId', options.userId));
        }
        if (options?.isRecipe !== undefined) {
            queries.push(Query.equal('isRecipe', options.isRecipe));
        }
        if (options?.followingIds && options.followingIds.length > 0) {
            queries.push(Query.equal('userId', options.followingIds));
        }
        if (options?.limit) {
            queries.push(Query.limit(options.limit));
        }
        if (options?.offset) {
            queries.push(Query.offset(options.offset));
        }

        queries.push(Query.orderDesc('$createdAt'));

        try {
            const result = await databases.listDocuments<Post>(
                APPWRITE_CONFIG.DATABASE_ID,
                APPWRITE_CONFIG.COLLECTION_ID_POSTS,
                queries
            );
            return result.documents;
        } catch (error) {
            console.error('Error listing posts:', error);
            return [];
        }
    },

    /**
     * Create a new post
     */
    async createPost(data: {
        userId: string;
        image: string;
        caption: string;
        location?: string;
        isRecipe?: boolean;
        recipeId?: string;
        tags?: string[];
    }): Promise<Post> {
        const post = await databases.createDocument<Post>(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_ID_POSTS,
            ID.unique(),
            {
                ...data,
                isRecipe: data.isRecipe || false,
                likesCount: 0,
                commentsCount: 0,
            }
        );

        // Increment author's post count
        const profile = await profileService.getProfile(data.userId);
        if (profile) {
            await profileService.incrementCounter(profile.$id, 'postsCount', 1);
        }

        return post;
    },

    /**
     * Update a post
     */
    async updatePost(
        postId: string,
        data: Partial<Pick<Post, 'caption' | 'location' | 'tags'>>
    ): Promise<Post> {
        return await databases.updateDocument<Post>(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_ID_POSTS,
            postId,
            data
        );
    },

    /**
     * Delete a post
     */
    async deletePost(postId: string, userId: string): Promise<void> {
        await databases.deleteDocument(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_ID_POSTS,
            postId
        );

        // Decrement author's post count
        const profile = await profileService.getProfile(userId);
        if (profile) {
            await profileService.incrementCounter(profile.$id, 'postsCount', -1);
        }
    },
};

// ============================================================================
// Comment Service
// ============================================================================

export const commentService = {
    /**
     * List comments for a post
     */
    async listComments(postId: string, limit: number = 50, offset: number = 0): Promise<Comment[]> {
        try {
            const result = await databases.listDocuments<Comment>(
                APPWRITE_CONFIG.DATABASE_ID,
                APPWRITE_CONFIG.COLLECTION_ID_COMMENTS,
                [
                    Query.equal('postId', postId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(limit),
                    Query.offset(offset),
                ]
            );
            return result.documents;
        } catch (error) {
            console.error('Error listing comments:', error);
            return [];
        }
    },

    /**
     * Create a comment on a post
     */
    async createComment(data: {
        postId: string;
        userId: string;
        content: string;
    }): Promise<Comment> {
        const comment = await databases.createDocument<Comment>(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_ID_COMMENTS,
            ID.unique(),
            {
                ...data,
                likesCount: 0,
            }
        );

        // Increment post's comment count
        const post = await postService.getPost(data.postId);
        if (post) {
            await databases.updateDocument(
                APPWRITE_CONFIG.DATABASE_ID,
                APPWRITE_CONFIG.COLLECTION_ID_POSTS,
                data.postId,
                { commentsCount: post.commentsCount + 1 }
            );
        }

        return comment;
    },

    /**
     * Delete a comment
     */
    async deleteComment(commentId: string, postId: string): Promise<void> {
        await databases.deleteDocument(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_ID_COMMENTS,
            commentId
        );

        // Decrement post's comment count
        const post = await postService.getPost(postId);
        if (post) {
            await databases.updateDocument(
                APPWRITE_CONFIG.DATABASE_ID,
                APPWRITE_CONFIG.COLLECTION_ID_POSTS,
                postId,
                { commentsCount: Math.max(0, post.commentsCount - 1) }
            );
        }
    },
};

// ============================================================================
// Like Service
// ============================================================================

export const likeService = {
    /**
     * Check if user has liked a target
     */
    async hasLiked(userId: string, targetType: 'post' | 'recipe' | 'comment', targetId: string): Promise<boolean> {
        try {
            const result = await databases.listDocuments<Like>(
                APPWRITE_CONFIG.DATABASE_ID,
                APPWRITE_CONFIG.COLLECTION_ID_LIKES,
                [
                    Query.equal('userId', userId),
                    Query.equal('targetType', targetType),
                    Query.equal('targetId', targetId),
                    Query.limit(1),
                ]
            );
            return result.documents.length > 0;
        } catch (error) {
            console.error('Error checking like:', error);
            return false;
        }
    },

    /**
     * Like a target (post, recipe, or comment)
     */
    async like(userId: string, targetType: 'post' | 'recipe' | 'comment', targetId: string): Promise<void> {
        // Check if already liked
        const alreadyLiked = await this.hasLiked(userId, targetType, targetId);
        if (alreadyLiked) {
            return; // Already liked
        }

        // Create like document
        await databases.createDocument<Like>(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_ID_LIKES,
            ID.unique(),
            { userId, targetType, targetId }
        );

        // Increment like count on target
        await this.incrementLikeCount(targetType, targetId, 1);
    },

    /**
     * Unlike a target
     */
    async unlike(userId: string, targetType: 'post' | 'recipe' | 'comment', targetId: string): Promise<void> {
        try {
            // Find the like document
            const result = await databases.listDocuments<Like>(
                APPWRITE_CONFIG.DATABASE_ID,
                APPWRITE_CONFIG.COLLECTION_ID_LIKES,
                [
                    Query.equal('userId', userId),
                    Query.equal('targetType', targetType),
                    Query.equal('targetId', targetId),
                    Query.limit(1),
                ]
            );

            if (result.documents.length === 0) {
                return; // Not liked
            }

            // Delete like document
            await databases.deleteDocument(
                APPWRITE_CONFIG.DATABASE_ID,
                APPWRITE_CONFIG.COLLECTION_ID_LIKES,
                result.documents[0].$id
            );

            // Decrement like count on target
            await this.incrementLikeCount(targetType, targetId, -1);
        } catch (error) {
            console.error('Error unliking:', error);
        }
    },

    /**
     * Toggle like status
     */
    async toggleLike(userId: string, targetType: 'post' | 'recipe' | 'comment', targetId: string): Promise<boolean> {
        const liked = await this.hasLiked(userId, targetType, targetId);
        if (liked) {
            await this.unlike(userId, targetType, targetId);
            return false;
        } else {
            await this.like(userId, targetType, targetId);
            return true;
        }
    },

    /**
     * Helper to increment like count on target document
     */
    async incrementLikeCount(targetType: 'post' | 'recipe' | 'comment', targetId: string, increment: number): Promise<void> {
        try {
            let collectionId: string;
            switch (targetType) {
                case 'post':
                    collectionId = APPWRITE_CONFIG.COLLECTION_ID_POSTS;
                    break;
                case 'recipe':
                    collectionId = APPWRITE_CONFIG.COLLECTION_ID_RECIPES;
                    break;
                case 'comment':
                    collectionId = APPWRITE_CONFIG.COLLECTION_ID_COMMENTS;
                    break;
            }

            const doc = await databases.getDocument(
                APPWRITE_CONFIG.DATABASE_ID,
                collectionId,
                targetId
            );

            await databases.updateDocument(
                APPWRITE_CONFIG.DATABASE_ID,
                collectionId,
                targetId,
                { likesCount: Math.max(0, (doc.likesCount || 0) + increment) }
            );
        } catch (error) {
            console.error('Error incrementing like count:', error);
        }
    },
};

// ============================================================================
// Follow Service
// ============================================================================

export const followService = {
    /**
     * Check if user is following another user
     */
    async isFollowing(followerId: string, followingId: string): Promise<boolean> {
        try {
            const result = await databases.listDocuments<Follow>(
                APPWRITE_CONFIG.DATABASE_ID,
                APPWRITE_CONFIG.COLLECTION_ID_FOLLOWS,
                [
                    Query.equal('followerId', followerId),
                    Query.equal('followingId', followingId),
                    Query.limit(1),
                ]
            );
            return result.documents.length > 0;
        } catch (error) {
            console.error('Error checking follow:', error);
            return false;
        }
    },

    /**
     * Follow a user
     */
    async follow(followerId: string, followingId: string): Promise<void> {
        if (followerId === followingId) {
            throw new Error('Cannot follow yourself');
        }

        // Check if already following
        const alreadyFollowing = await this.isFollowing(followerId, followingId);
        if (alreadyFollowing) {
            return;
        }

        // Create follow relationship
        await databases.createDocument<Follow>(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTION_ID_FOLLOWS,
            ID.unique(),
            { followerId, followingId }
        );

        // Update counts
        const followerProfile = await profileService.getProfile(followerId);
        const followingProfile = await profileService.getProfile(followingId);

        if (followerProfile) {
            await profileService.incrementCounter(followerProfile.$id, 'followingCount', 1);
        }
        if (followingProfile) {
            await profileService.incrementCounter(followingProfile.$id, 'followersCount', 1);
        }
    },

    /**
     * Unfollow a user
     */
    async unfollow(followerId: string, followingId: string): Promise<void> {
        try {
            // Find the follow document
            const result = await databases.listDocuments<Follow>(
                APPWRITE_CONFIG.DATABASE_ID,
                APPWRITE_CONFIG.COLLECTION_ID_FOLLOWS,
                [
                    Query.equal('followerId', followerId),
                    Query.equal('followingId', followingId),
                    Query.limit(1),
                ]
            );

            if (result.documents.length === 0) {
                return;
            }

            // Delete follow relationship
            await databases.deleteDocument(
                APPWRITE_CONFIG.DATABASE_ID,
                APPWRITE_CONFIG.COLLECTION_ID_FOLLOWS,
                result.documents[0].$id
            );

            // Update counts
            const followerProfile = await profileService.getProfile(followerId);
            const followingProfile = await profileService.getProfile(followingId);

            if (followerProfile) {
                await profileService.incrementCounter(followerProfile.$id, 'followingCount', -1);
            }
            if (followingProfile) {
                await profileService.incrementCounter(followingProfile.$id, 'followersCount', -1);
            }
        } catch (error) {
            console.error('Error unfollowing:', error);
        }
    },

    /**
     * Toggle follow status
     */
    async toggleFollow(followerId: string, followingId: string): Promise<boolean> {
        const following = await this.isFollowing(followerId, followingId);
        if (following) {
            await this.unfollow(followerId, followingId);
            return false;
        } else {
            await this.follow(followerId, followingId);
            return true;
        }
    },

    /**
     * Get list of users that a user is following
     */
    async getFollowing(userId: string, limit: number = 50, offset: number = 0): Promise<string[]> {
        try {
            const result = await databases.listDocuments<Follow>(
                APPWRITE_CONFIG.DATABASE_ID,
                APPWRITE_CONFIG.COLLECTION_ID_FOLLOWS,
                [
                    Query.equal('followerId', userId),
                    Query.limit(limit),
                    Query.offset(offset),
                ]
            );
            return result.documents.map((doc) => doc.followingId);
        } catch (error) {
            console.error('Error getting following list:', error);
            return [];
        }
    },

    /**
     * Get list of users following a user
     */
    async getFollowers(userId: string, limit: number = 50, offset: number = 0): Promise<string[]> {
        try {
            const result = await databases.listDocuments<Follow>(
                APPWRITE_CONFIG.DATABASE_ID,
                APPWRITE_CONFIG.COLLECTION_ID_FOLLOWS,
                [
                    Query.equal('followingId', userId),
                    Query.limit(limit),
                    Query.offset(offset),
                ]
            );
            return result.documents.map((doc) => doc.followerId);
        } catch (error) {
            console.error('Error getting followers list:', error);
            return [];
        }
    },
};

// ============================================================================
// Storage Service
// ============================================================================

export const storageService = {
    /**
     * Upload an image file to Appwrite Storage
     */
    async uploadImage(file: File): Promise<string> {
        const uploadedFile = await storage.createFile(
            APPWRITE_CONFIG.BUCKET_ID_IMAGES,
            ID.unique(),
            file
        );
        return uploadedFile.$id;
    },

    /**
     * Get image URL for preview
     */
    getImageUrl(fileId: string): string {
        return `${APPWRITE_CONFIG.ENDPOINT}/storage/buckets/${APPWRITE_CONFIG.BUCKET_ID_IMAGES}/files/${fileId}/view?project=${APPWRITE_CONFIG.PROJECT_ID}`;
    },

    /**
     * Get image preview URL with dimensions
     */
    getImagePreview(fileId: string, width: number = 500, height: number = 500): string {
        return `${APPWRITE_CONFIG.ENDPOINT}/storage/buckets/${APPWRITE_CONFIG.BUCKET_ID_IMAGES}/files/${fileId}/preview?width=${width}&height=${height}&project=${APPWRITE_CONFIG.PROJECT_ID}`;
    },

    /**
     * Delete an image file
     */
    async deleteImage(fileId: string): Promise<void> {
        await storage.deleteFile(APPWRITE_CONFIG.BUCKET_ID_IMAGES, fileId);
    },
};

// ============================================================================
// Auth Helper (extends existing auth hook functionality)
// ============================================================================

export const authService = {
    /**
     * Get current user session
     */
    async getCurrentUser() {
        try {
            return await account.get();
        } catch (error) {
            return null;
        }
    },

    /**
     * Get or create profile for current user
     */
    async ensureProfile(userId: string, name: string, email: string): Promise<Profile | null> {
        // Check if profile exists
        let profile = await profileService.getProfile(userId);

        if (!profile) {
            // Create profile with username from email
            const handle = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
            profile = await profileService.createProfile({
                userId,
                name,
                handle,
                bio: '',
            });
        }

        return profile;
    },
};
