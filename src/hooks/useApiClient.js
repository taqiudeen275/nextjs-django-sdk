'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useApiClient = useApiClient;
var ApiProvider_1 = require("../components/ApiProvider");
var apiClient_1 = require("../utils/apiClient");
function useApiClient() {
    var config = (0, ApiProvider_1.useApiConfig)();
    return (0, apiClient_1.getApiClient)(config);
}
