import { DocumentNode } from 'graphql';
import { CATEGORY, DateTime } from './schema';
export declare namespace WaitForNewPostSubscription {
    interface Arguments {
    }
    interface newPost {
        author: newPost.author;
        category: newPost.category;
        createdAt: newPost.createdAt;
        postedAt: newPost.postedAt;
    }
    namespace newPost {
        interface author {
            name: author.name;
        }
        namespace author {
            type name = string;
        }
        type category = CATEGORY;
        type createdAt = DateTime;
        type postedAt = DateTime;
    }
}
export interface WaitForNewPostSubscription {
    newPost: WaitForNewPostSubscription.newPost;
}
export declare const waitForNewPostSubscription: DocumentNode;
