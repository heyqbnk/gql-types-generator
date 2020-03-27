"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_tag_1 = require("graphql-tag");
exports.WaitForNewPostSubscription = graphql_tag_1.default("subscription waitForNewPost {\n  newPost{\n    author {\n      name\n    }\n    category\n    createdAt\n    postedAt\n  }\n}");
