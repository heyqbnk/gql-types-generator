"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var schema_1 = require("./schema");
exports.schema = schema_1.default;
__export(require("./schema"));
__export(require("./deletePostMutation"));
var deletePostMutation_1 = require("./deletePostMutation");
exports.deletePostMutation = deletePostMutation_1.default;
__export(require("./updatePostMutation"));
var updatePostMutation_1 = require("./updatePostMutation");
exports.updatePostMutation = updatePostMutation_1.default;
__export(require("./getAllPostsQuery"));
var getAllPostsQuery_1 = require("./getAllPostsQuery");
exports.getAllPostsQuery = getAllPostsQuery_1.default;
__export(require("./getPostQuery"));
var getPostQuery_1 = require("./getPostQuery");
exports.getPostQuery = getPostQuery_1.default;
__export(require("./waitForNewPostSubscription"));
var waitForNewPostSubscription_1 = require("./waitForNewPostSubscription");
exports.waitForNewPostSubscription = waitForNewPostSubscription_1.default;
