"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LEETCODE_GRAPHQL_API_URL = void 0;
exports.getClient = getClient;
var graphql_request_1 = require("graphql-request");
var client;
exports.LEETCODE_GRAPHQL_API_URL = 'https://leetcode.com/graphql';
function getClient() {
    if (!client) {
        client = new graphql_request_1.GraphQLClient(exports.LEETCODE_GRAPHQL_API_URL);
    }
    return client;
}
