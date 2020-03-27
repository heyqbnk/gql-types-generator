import { DocumentNode } from 'graphql';
import { CATEGORY, DateTime } from './schema';
export declare namespace GetPostQuery {
    interface Arguments {
        id: any;
    }
    interface Post {
        author: Post.Author;
        category: Post.Category;
        createdAt: Post.CreatedAt;
        postedAt: Post.PostedAt;
    }
    namespace Post {
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
export interface GetPostQuery {
    post: GetPostQuery.Post;
}
export declare const getPostQuery: DocumentNode;
