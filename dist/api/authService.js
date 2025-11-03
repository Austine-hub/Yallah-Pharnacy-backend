"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = void 0;
const axiosClient_js_1 = __importDefault(require("./axiosClient.js"));
const loginUser = async (payload) => {
    const { data } = await axiosClient_js_1.default.post("/auth/login", payload);
    return data;
};
exports.loginUser = loginUser;
//# sourceMappingURL=authService.js.map