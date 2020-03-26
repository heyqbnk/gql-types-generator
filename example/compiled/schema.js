"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * All available project colors
 */
var CATEGORY;
(function (CATEGORY) {
    CATEGORY["NEWS"] = "NEWS";
    CATEGORY["SPORT"] = "SPORT";
    CATEGORY["HUMOR"] = "HUMOR";
    CATEGORY["WAR"] = "WAR";
    CATEGORY["PROGRAMMING"] = "PROGRAMMING";
})(CATEGORY = exports.CATEGORY || (exports.CATEGORY = {}));
var schema = "\"All available project colors\"\nenum CATEGORY {\n  NEWS,\n  SPORT,\n  HUMOR,\n  WAR,\n  PROGRAMMING\n}\n\"Means a date in ISO format\"\nscalar DateTime\n\"Author of post\"\ntype PostAuthor {\n  \"User full name\"\n  name: String!\n  \"Date when user was registered\"\n  registeredAt: DateTime!\n  \"Date when user was banned\"\n  bannedAt: DateTime\n}\n\n\"Usual post\"\ninterface Post {\n  \"Post id\"\n  id: ID!\n  \"Post author\"\n  author: PostAuthor!\n  \"Post content\"\n  text: String!\n  \"Post category\"\n  category: CATEGORY!\n  \"Date when post was created\"\n  createdAt: DateTime!\n  \"Date when post was updated\"\n  updatedAt: DateTime\n  \"Date when post was deleted\"\n  deletedAt: DateTime\n}\n\n\"Post that already was posted\"\ntype PostedPost implements Post {\n  \"Post id\"\n  id: ID!\n  \"Post author\"\n  author: PostAuthor!\n  \"Post content\"\n  text: String!\n  \"Post category\"\n  category: CATEGORY!\n  \"Date when post was created\"\n  createdAt: DateTime!\n  \"Date when post was updated\"\n  updatedAt: DateTime\n  \"Date when post was deleted\"\n  deletedAt: DateTime\n  \"Date when post was posted\"\n  postedAt: DateTime!\n}\n\n\"Post that is currently reviewed by moderators\"\ntype ModeratedPost implements Post {\n  \"Post id\"\n  id: ID!\n  \"Post author\"\n  author: PostAuthor!\n  \"Post content\"\n  text: String!\n  \"Post category\"\n  category: CATEGORY!\n  \"Date when post was created\"\n  createdAt: DateTime!\n  \"Date when post was updated\"\n  updatedAt: DateTime\n  \"Date when post was deleted\"\n  deletedAt: DateTime\n  \"Date when moderation started\"\n  startedModerationAt: DateTime!\n}\n\n\"Any type of post\"\nunion AnyPost = ModeratedPost | PostedPost\n\n\"Input to get posts\"\ninput PostsInput {\n  limit: Int!\n  offset: Int!\n}\n\n\"Data to create post\"\ninput PostData {\n  \"Post text\"\n  content: String!\n  \"Post category\"\n  category: CATEGORY!\n}\n\n\"Root Query type\"\ntype Query {\n  \"Get certain post\"\n  post(id: ID!): PostedPost\n  \"Ge posts with limit and offset\"\n  posts(input: PostsInput): [PostedPost!]!\n}\n\n\"Root Mutation type\"\ntype Mutation {\n  \"Updates post and returns updated entity\"\n  updatePost(id: ID!, text: String!): PostedPost\n  \"Deletes post\"\n  deletePost(id: ID!): Boolean!\n  \"Creates post\"\n  createPost(data: PostData): ModeratedPost!\n}\n\n\"Root Subscription type\"\ntype Subscription {\n  \"Returns newly created post\"\n  newPost: PostedPost!\n}\n";
exports.default = schema;
