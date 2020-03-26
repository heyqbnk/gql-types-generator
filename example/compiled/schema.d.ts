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
    type Id = any;
    /**
     * Post author
     */
    type Author = PostAuthor;
    /**
     * Post content
     */
    type Text = string;
    /**
     * Post category
     */
    type Category = CATEGORY;
    /**
     * Date when post was created
     */
    type CreatedAt = DateTime;
    /**
     * Date when post was updated
     */
    type UpdatedAt = DateTime | null;
    /**
     * Date when post was deleted
     */
    type DeletedAt = DateTime | null;
}
export interface Post {
    id: Post.Id;
    author: Post.Author;
    text: Post.Text;
    category: Post.Category;
    createdAt: Post.CreatedAt;
    updatedAt: Post.UpdatedAt;
    deletedAt: Post.DeletedAt;
}
/**
 * Input to get posts
 */
export declare namespace PostsInput {
    type Limit = number;
    type Offset = number;
}
export interface PostsInput {
    limit: PostsInput.Limit;
    offset: PostsInput.Offset;
}
/**
 * Data to create post
 */
export declare namespace PostData {
    /**
     * Post text
     */
    type Content = string;
    /**
     * Post category
     */
    type Category = CATEGORY;
}
export interface PostData {
    content: PostData.Content;
    category: PostData.Category;
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
    type Post = PostedPost | null;
    namespace Post {
        interface Arguments {
            id: any;
        }
    }
    /**
     * Ge posts with limit and offset
     */
    type Posts = PostedPost[];
    namespace Posts {
        interface Arguments {
            input: PostsInput | null;
        }
    }
}
export interface Query {
    post: Query.Post;
    posts: Query.Posts;
}
/**
 * Post that already was posted
 */
export declare namespace PostedPost {
    /**
     * Post id
     */
    type Id = any;
    /**
     * Post author
     */
    type Author = PostAuthor;
    /**
     * Post content
     */
    type Text = string;
    /**
     * Post category
     */
    type Category = CATEGORY;
    /**
     * Date when post was created
     */
    type CreatedAt = DateTime;
    /**
     * Date when post was updated
     */
    type UpdatedAt = DateTime | null;
    /**
     * Date when post was deleted
     */
    type DeletedAt = DateTime | null;
    /**
     * Date when post was posted
     */
    type PostedAt = DateTime;
}
export interface PostedPost {
    id: PostedPost.Id;
    author: PostedPost.Author;
    text: PostedPost.Text;
    category: PostedPost.Category;
    createdAt: PostedPost.CreatedAt;
    updatedAt: PostedPost.UpdatedAt;
    deletedAt: PostedPost.DeletedAt;
    postedAt: PostedPost.PostedAt;
}
/**
 * Author of post
 */
export declare namespace PostAuthor {
    /**
     * User full name
     */
    type Name = string;
    /**
     * Date when user was registered
     */
    type RegisteredAt = DateTime;
    /**
     * Date when user was banned
     */
    type BannedAt = DateTime | null;
}
export interface PostAuthor {
    name: PostAuthor.Name;
    registeredAt: PostAuthor.RegisteredAt;
    bannedAt: PostAuthor.BannedAt;
}
/**
 * Root Mutation type
 */
export declare namespace Mutation {
    /**
     * Updates post and returns updated entity
     */
    type UpdatePost = PostedPost | null;
    namespace UpdatePost {
        interface Arguments {
            id: any;
            text: string;
        }
    }
    /**
     * Deletes post
     */
    type DeletePost = boolean;
    namespace DeletePost {
        interface Arguments {
            id: any;
        }
    }
    /**
     * Creates post
     */
    type CreatePost = ModeratedPost;
    namespace CreatePost {
        interface Arguments {
            data: PostData | null;
        }
    }
}
export interface Mutation {
    updatePost: Mutation.UpdatePost;
    deletePost: Mutation.DeletePost;
    createPost: Mutation.CreatePost;
}
/**
 * Post that is currently reviewed by moderators
 */
export declare namespace ModeratedPost {
    /**
     * Post id
     */
    type Id = any;
    /**
     * Post author
     */
    type Author = PostAuthor;
    /**
     * Post content
     */
    type Text = string;
    /**
     * Post category
     */
    type Category = CATEGORY;
    /**
     * Date when post was created
     */
    type CreatedAt = DateTime;
    /**
     * Date when post was updated
     */
    type UpdatedAt = DateTime | null;
    /**
     * Date when post was deleted
     */
    type DeletedAt = DateTime | null;
    /**
     * Date when moderation started
     */
    type StartedModerationAt = DateTime;
}
export interface ModeratedPost {
    id: ModeratedPost.Id;
    author: ModeratedPost.Author;
    text: ModeratedPost.Text;
    category: ModeratedPost.Category;
    createdAt: ModeratedPost.CreatedAt;
    updatedAt: ModeratedPost.UpdatedAt;
    deletedAt: ModeratedPost.DeletedAt;
    startedModerationAt: ModeratedPost.StartedModerationAt;
}
/**
 * Root Subscription type
 */
export declare namespace Subscription {
    /**
     * Returns newly created post
     */
    type NewPost = PostedPost;
}
export interface Subscription {
    newPost: Subscription.NewPost;
}
declare const schema: string;
export default schema;
