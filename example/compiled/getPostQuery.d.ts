import { DocumentNode } from 'graphql';
import { CATEGORY, DateTime } from './schema';
export declare namespace GetPostQuery {
    interface Arguments {
        id: any;
    }
    interface post {
        author: post.author;
        category: post.category;
        createdAt: post.createdAt;
        postedAt: post.postedAt;
    }
    namespace post {
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
export interface GetPostQuery {
    post: GetPostQuery.post;
}
export declare const GetPostQuery: DocumentNode;
