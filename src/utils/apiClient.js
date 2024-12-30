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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApiClient = getApiClient;
var types_1 = require("../types");
var cookies_1 = require("./cookies");
function getApiClient(config) {
    var _this = this;
    var getHeaders = function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([], args_1, true), void 0, function (hasBody) {
            var headers, accessToken, csrfToken;
            if (hasBody === void 0) { hasBody = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        headers = {};
                        return [4 /*yield*/, (0, cookies_1.getCookie)('access_token')];
                    case 1:
                        accessToken = _a.sent();
                        if (accessToken) {
                            headers['Authorization'] = "".concat(config.tokenPrefix || 'Bearer', " ").concat(accessToken);
                        }
                        if (hasBody) {
                            headers['Content-Type'] = 'application/json';
                        }
                        if (!config.csrfEnabled) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, cookies_1.getCookie)('csrftoken')];
                    case 2:
                        csrfToken = _a.sent();
                        if (csrfToken) {
                            headers['X-CSRFToken'] = csrfToken;
                        }
                        _a.label = 3;
                    case 3: return [2 /*return*/, headers];
                }
            });
        });
    };
    var handleResponse = function (response) { return __awaiter(_this, void 0, void 0, function () {
        var data, refreshError_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, response.json()];
                case 1:
                    data = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 9];
                    if (!(response.status === 401)) return [3 /*break*/, 8];
                    if (!config.autoRefresh) return [3 /*break*/, 6];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, refreshTokens()];
                case 3:
                    _a.sent();
                    return [2 /*return*/, 'retry'];
                case 4:
                    refreshError_1 = _a.sent();
                    (0, cookies_1.deleteCookie)('access_token');
                    (0, cookies_1.deleteCookie)('refresh_token');
                    throw new types_1.ApiError('Unauthorized', response.status, data);
                case 5: return [3 /*break*/, 7];
                case 6: throw new types_1.ApiError('Unauthorized', response.status, data);
                case 7: return [3 /*break*/, 9];
                case 8: throw new types_1.ApiError(data.detail || 'API Error', response.status, data);
                case 9: return [2 /*return*/, data];
            }
        });
    }); };
    var refreshTokens = function () { return __awaiter(_this, void 0, void 0, function () {
        var refreshToken, refreshResponse, refreshData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    refreshToken = (0, cookies_1.getCookie)('refresh_token');
                    if (!refreshToken) {
                        throw new Error('No refresh token available');
                    }
                    return [4 /*yield*/, fetch("".concat(config.baseUrl, "/api/token/refresh/"), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ refresh: refreshToken }),
                        })];
                case 1:
                    refreshResponse = _a.sent();
                    return [4 /*yield*/, handleResponse(refreshResponse)];
                case 2:
                    refreshData = _a.sent();
                    if (refreshData !== 'retry') {
                        (0, cookies_1.setCookie)('access_token', refreshData.access, config.accessTokenLifetime);
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    var fetcher = function (url_1) {
        var args_1 = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args_1[_i - 1] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([url_1], args_1, true), void 0, function (url, options) {
            var headers, response, data, _a, retryResponse;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, getHeaders(!!options.body)];
                    case 1:
                        headers = _b.sent();
                        return [4 /*yield*/, fetch("".concat(config.baseUrl).concat(url), __assign(__assign({}, options), { headers: __assign(__assign({}, headers), (options.headers || {})) }))];
                    case 2:
                        response = _b.sent();
                        return [4 /*yield*/, handleResponse(response)];
                    case 3:
                        data = _b.sent();
                        if (!(data === 'retry')) return [3 /*break*/, 6];
                        _a = options;
                        return [4 /*yield*/, getHeaders(!!options.body)];
                    case 4:
                        _a.headers = _b.sent();
                        return [4 /*yield*/, fetch("".concat(config.baseUrl).concat(url), __assign(__assign({}, options), { headers: __assign(__assign({}, options.headers), (options.headers || {})) }))];
                    case 5:
                        retryResponse = _b.sent();
                        return [2 /*return*/, handleResponse(retryResponse)];
                    case 6: return [2 /*return*/, data];
                }
            });
        });
    };
    return {
        fetch: fetcher,
        getHeaders: getHeaders,
    };
}
