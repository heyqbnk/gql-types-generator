import gql from 'graphql-tag';
import { DocumentNode } from 'graphql';

import { CATEGORY, DateTime } from './schema';

export namespace GetAllPostsQuery {
  export interface Arguments {
  }
  export interface Posts {
    author: Posts.Author;
    text: Posts.Text;
    category: Posts.Category;
    createdAt: Posts.CreatedAt;
    postedAt: Posts.PostedAt;
  }
  export namespace Posts {
    export interface Author {
      name: Author.Name;
    }
    export namespace Author {
      export type Name = string;
    }
    export type Text = string;
    export type Category = CATEGORY;
    export type CreatedAt = DateTime;
    export type PostedAt = DateTime;
  }
}
export interface GetAllPostsQuery {
  posts: GetAllPostsQuery.Posts;
}
export const getAllPostsQuery: DocumentNode = gql(`query getAllPosts {
  posts {
    author {
      name
    }
    text
    category
    createdAt
    postedAt
  }
}`);
