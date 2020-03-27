/**
 * Means a date in ISO format
 */
export declare type DateTime = string;
/**
 * All available project colors
 */
export declare enum CATEGORY {
    NEWS = "NEWS",
    SPORT = "SPORT",
    HUMOR = "HUMOR",
    WAR = "WAR",
    PROGRAMMING = "PROGRAMMING"
}
/**
 * Usual post
 */
export declare namespace Post {
    /**
     * Post id
     */
    type id = any;
    /**
     * Post author
     */
    type author = PostAuthor;
    /**
     * Post content
     */
    type text = string;
    /**
     * Post category
     */
    type category = CATEGORY;
    /**
     * Date when post was created
     */
    type createdAt = DateTime;
    /**
     * Date when post was updated
     */
    type updatedAt = DateTime | null;
    /**
     * Date when post was deleted
     */
    type deletedAt = DateTime | null;
}
export interface Post {
    id: Post.id;
    author: Post.author;
    text: Post.text;
    category: Post.category;
    createdAt: Post.createdAt;
    updatedAt: Post.updatedAt;
    deletedAt: Post.deletedAt;
}
/**
 * Input to get posts
 */
export declare namespace PostsInput {
    type limit = number;
    type offset = number;
}
export interface PostsInput {
    limit: PostsInput.limit;
    offset: PostsInput.offset;
}
/**
 * Data to create post
 */
export declare namespace PostData {
    /**
     * Post text
     */
    type content = string;
    /**
     * Post category
     */
    type category = CATEGORY;
}
export interface PostData {
    content: PostData.content;
    category: PostData.category;
}
/**
 * Any type of post
 */
export declare type AnyPost = ModeratedPost | PostedPost;
/**
 * Root Query type
 */
export declare namespace Query {
    /**
     * Get certain post
     */
    type post = PostedPost | null;
    namespace post {
        interface Arguments {
            id: any;
        }
    }
    /**
     * Ge posts with limit and offset
     */
    type posts = PostedPost[];
    namespace posts {
        interface Arguments {
            input: PostsInput | null;
        }
    }
}
export interface Query {
    post: Query.post;
    posts: Query.posts;
}
/**
 * Post that already was posted
 */
export declare namespace PostedPost {
    /**
     * Post id
     */
    type id = any;
    /**
     * Post author
     */
    type author = PostAuthor;
    /**
     * Post content
     */
    type text = string;
    /**
     * Post category
     */
    type category = CATEGORY;
    /**
     * Date when post was created
     */
    type createdAt = DateTime;
    /**
     * Date when post was updated
     */
    type updatedAt = DateTime | null;
    /**
     * Date when post was deleted
     */
    type deletedAt = DateTime | null;
    /**
     * Date when post was posted
     */
    type postedAt = DateTime;
}
export interface PostedPost {
    id: PostedPost.id;
    author: PostedPost.author;
    text: PostedPost.text;
    category: PostedPost.category;
    createdAt: PostedPost.createdAt;
    updatedAt: PostedPost.updatedAt;
    deletedAt: PostedPost.deletedAt;
    postedAt: PostedPost.postedAt;
}
/**
 * Author of post
 */
export declare namespace PostAuthor {
    /**
     * User full name
     */
    type name = string;
    /**
     * Date when user was registered
     */
    type registeredAt = DateTime;
    /**
     * Date when user was banned
     */
    type bannedAt = DateTime | null;
}
export interface PostAuthor {
    name: PostAuthor.name;
    registeredAt: PostAuthor.registeredAt;
    bannedAt: PostAuthor.bannedAt;
}
/**
 * Root Mutation type
 */
export declare namespace Mutation {
    /**
     * Updates post and returns updated entity
     */
    type updatePost = PostedPost | null;
    namespace updatePost {
        interface Arguments {
            id: any;
            text: string;
        }
    }
    /**
     * Deletes post
     */
    type deletePost = boolean;
    namespace deletePost {
        interface Arguments {
            id: any;
        }
    }
    /**
     * Creates post
     */
    type createPost = ModeratedPost;
    namespace createPost {
        interface Arguments {
            data: PostData | null;
        }
    }
}
export interface Mutation {
    updatePost: Mutation.updatePost;
    deletePost: Mutation.deletePost;
    createPost: Mutation.createPost;
}
/**
 * Post that is currently reviewed by moderators
 */
export declare namespace ModeratedPost {
    /**
     * Post id
     */
    type id = any;
    /**
     * Post author
     */
    type author = PostAuthor;
    /**
     * Post content
     */
    type text = string;
    /**
     * Post category
     */
    type category = CATEGORY;
    /**
     * Date when post was created
     */
    type createdAt = DateTime;
    /**
     * Date when post was updated
     */
    type updatedAt = DateTime | null;
    /**
     * Date when post was deleted
     */
    type deletedAt = DateTime | null;
    /**
     * Date when moderation started
     */
    type startedModerationAt = DateTime;
}
export interface ModeratedPost {
    id: ModeratedPost.id;
    author: ModeratedPost.author;
    text: ModeratedPost.text;
    category: ModeratedPost.category;
    createdAt: ModeratedPost.createdAt;
    updatedAt: ModeratedPost.updatedAt;
    deletedAt: ModeratedPost.deletedAt;
    startedModerationAt: ModeratedPost.startedModerationAt;
}
/**
 * Root Subscription type
 */
export declare namespace Subscription {
    /**
     * Returns newly created post
     */
    type newPost = PostedPost;
}
export interface Subscription {
    newPost: Subscription.newPost;
}
declare const schema: string;
export default schema;
