'use client';
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useApi = useApi;
var swr_1 = __importDefault(require("swr"));
function useApi(url, apiClient, options, fetchOptions) {
    var _a = (0, swr_1.default)(url, function (url) { return apiClient.fetch(url, fetchOptions); }, __assign({ onErrorRetry: function (error, key, config, revalidate, _a) {
            var retryCount = _a.retryCount;
            if (retryCount >= 3)
                return;
            if (error.status === 401 || error.status === 403)
                return;
            setTimeout(function () { return revalidate({ retryCount: retryCount + 1 }); }, 3000);
        } }, options)), data = _a.data, error = _a.error, isLoading = _a.isLoading, mutate = _a.mutate;
    return { data: data, error: error, isLoading: isLoading, mutate: mutate };
}
