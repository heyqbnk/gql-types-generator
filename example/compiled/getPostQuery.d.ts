import { DocumentNode } from 'graphql';
import { CATEGORY, DateTime } from './schema';
export declare namespace GetPostQuery {
    interface Arguments {
        id: any;
    }
    type post = {
        author: post.author;
        category: post.category;
        createdAt: post.createdAt;
        postedAt: post.postedAt;
    } | null;
    namespace post {
        type author = {
            name: author.name;
        };
        namespace author {
            type name = string;
        }
        type category = CATEGORY;
        type createdAt = DateTime;
        type postedAt = DateTime;
    }
}
export interface GetPostQuery {
    post: GetPostQuery.post;
}
export declare const getPostQuery: DocumentNode;
