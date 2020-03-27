"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_tag_1 = require("graphql-tag");
exports.GetPostQuery = graphql_tag_1.default("query getPost($id: ID!) {\n  post(id: $id) {\n    author {\n      name\n    }\n    category\n    createdAt\n    postedAt\n  }\n}");
