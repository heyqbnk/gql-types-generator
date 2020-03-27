"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_tag_1 = require("graphql-tag");
exports.UpdatePostMutation = graphql_tag_1.default("mutation updatePost($id: ID!, $text: String!) {\n  updatePost(id: $id, text: $text) {\n    updatedAt\n  }\n}");
