import { DocumentNode } from 'graphql';
import { CATEGORY, DateTime } from './schema';
export declare namespace WaitForNewPostSubscription {
    interface Arguments {
    }
    interface NewPost {
        author: NewPost.Author;
        category: NewPost.Category;
        createdAt: NewPost.CreatedAt;
        postedAt: NewPost.PostedAt;
    }
    namespace NewPost {
        interface Author {
            name: Author.Name;
        }
        namespace Author {
            type Name = string;
        }
        type Category = CATEGORY;
        type CreatedAt = DateTime;
        type PostedAt = DateTime;
    }
}
export interface WaitForNewPostSubscription {
    newPost: WaitForNewPostSubscription.NewPost;
}
export declare const waitForNewPostSubscription: DocumentNode;
