"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_tag_1 = require("graphql-tag");
exports.deletePostMutation = graphql_tag_1.default("mutation deletePost($id: ID!) {\n  deletePost(id: $id)\n}");
