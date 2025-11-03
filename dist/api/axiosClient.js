"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const axiosClient = axios_1.default.create({
    baseURL: process.env.VITE_API_URL || "http://localhost:5000/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});
axiosClient.interceptors.response.use((response) => response, (error) => {
    console.error("❌ API Error:", error.response?.data || error.message);
    return Promise.reject(error);
});
exports.default = axiosClient;
//# sourceMappingURL=axiosClient.js.map