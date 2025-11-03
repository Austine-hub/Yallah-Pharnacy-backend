"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initiatePayment = void 0;
const axiosClient_js_1 = __importDefault(require("./axiosClient.js"));
const initiatePayment = async (amount) => {
    const { data } = await axiosClient_js_1.default.post("/payment/initiate", { amount });
    return data;
};
exports.initiatePayment = initiatePayment;
//# sourceMappingURL=paymentService.js.map