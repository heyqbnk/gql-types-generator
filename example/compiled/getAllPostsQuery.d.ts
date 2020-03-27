import { DocumentNode } from 'graphql';
import { CATEGORY, DateTime } from './schema';
export declare namespace GetAllPostsQuery {
    interface Arguments {
    }
    interface posts {
        author: posts.author;
        text: posts.text;
        category: posts.category;
        createdAt: posts.createdAt;
        postedAt: posts.postedAt;
    }
    namespace posts {
        interface author {
            name: author.name;
        }
        namespace author {
            type name = string;
        }
        type text = string;
        type category = CATEGORY;
        type createdAt = DateTime;
        type postedAt = DateTime;
    }
}
export interface GetAllPostsQuery {
    posts: GetAllPostsQuery.posts;
}
export declare const getAllPostsQuery: DocumentNode;
