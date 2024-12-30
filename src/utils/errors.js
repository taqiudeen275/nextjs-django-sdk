"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleApiError = void 0;
var types_1 = require("../types");
var handleApiError = function (error) {
    if (error instanceof types_1.ApiError) {
        switch (error.status) {
            case 401:
                // Handle 401 errors
                break;
            case 403:
                // Handle 403 errors
                break;
            default:
            // Handle other errors
        }
    }
};
exports.handleApiError = handleApiError;
