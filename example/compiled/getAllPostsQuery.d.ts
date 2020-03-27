import { DocumentNode } from 'graphql';
import { CATEGORY, DateTime } from './schema';
export declare namespace GetAllPostsQuery {
    interface Arguments {
    }
    interface Posts {
        author: Posts.Author;
        text: Posts.Text;
        category: Posts.Category;
        createdAt: Posts.CreatedAt;
        postedAt: Posts.PostedAt;
    }
    namespace Posts {
        interface Author {
            name: Author.Name;
        }
        namespace Author {
            type Name = string;
        }
        type Text = string;
        type Category = CATEGORY;
        type CreatedAt = DateTime;
        type PostedAt = DateTime;
    }
}
export interface GetAllPostsQuery {
    posts: GetAllPostsQuery.Posts;
}
export declare const getAllPostsQuery: DocumentNode;
