"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_tag_1 = require("graphql-tag");
exports.GetAllPostsQuery = graphql_tag_1.default("query getAllPosts {\n  posts {\n    author {\n      name\n    }\n    text\n    category\n    createdAt\n    postedAt\n  }\n}");
