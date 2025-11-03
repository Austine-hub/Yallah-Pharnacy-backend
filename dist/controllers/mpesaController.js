"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.callbackHandler = exports.validateTransaction = exports.initiateSTKPush = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const mpesaAPI_1 = require("../utils/mpesaAPI");
const responseHandlers_1 = require("../utils/responseHandlers");
const logger_1 = __importDefault(require("../utils/logger"));
dotenv_1.default.config();
/**
 * Initiates an M-Pesa STK Push (Lipa na M-Pesa Online).
 */
const initiateSTKPush = async (req, res) => {
    const { amount, phone } = req.body;
    if (!amount || !phone) {
        return (0, responseHandlers_1.errorResponse)(res, 400, "Amount and phone number are required for payment.");
    }
    if (typeof amount !== "number" || amount <= 0) {
        return (0, responseHandlers_1.errorResponse)(res, 400, "Invalid amount. Must be a positive number.");
    }
    try {
        const accessToken = await (0, mpesaAPI_1.getAccessToken)();
        const timestamp = new Date()
            .toISOString()
            .replace(/[-T:.Z]/g, "")
            .substring(0, 14);
        const shortcode = process.env.MPESA_SHORTCODE;
        const passkey = process.env.MPESA_PASSKEY;
        if (!shortcode || !passkey) {
            throw new Error("M-Pesa Shortcode or Passkey environment variables are not set.");
        }
        const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
        const mpesaResponse = await axios_1.default.post("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
            BusinessShortCode: shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: amount,
            PartyA: phone,
            PartyB: shortcode,
            PhoneNumber: phone,
            CallBackURL: process.env.CALLBACK_URL,
            AccountReference: "PharmacyPayment",
            TransactionDesc: "Payment for goods",
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });
        logger_1.default.info("✅ M-Pesa STK Push initiated successfully.", mpesaResponse.data);
        return (0, responseHandlers_1.successResponse)(res, "STK push initiated. Awaiting confirmation.", mpesaResponse.data);
    }
    catch (error) {
        // Safely narrow down the error type
        if (axios_1.default.isAxiosError(error)) {
            logger_1.default.error("❌ M-Pesa STK Push Axios Error:", error.response?.data || error.message);
            return (0, responseHandlers_1.errorResponse)(res, 500, "Failed to initiate M-Pesa STK push.", error.response?.data || error.message);
        }
        else if (error instanceof Error) {
            logger_1.default.error("❌ M-Pesa STK Push General Error:", error.message);
            return (0, responseHandlers_1.errorResponse)(res, 500, "Failed to initiate M-Pesa STK push.", error.message);
        }
        else {
            logger_1.default.error("❌ M-Pesa STK Push Unknown Error:", error);
            return (0, responseHandlers_1.errorResponse)(res, 500, "An unknown error occurred during M-Pesa STK push.");
        }
    }
};
exports.initiateSTKPush = initiateSTKPush;
/**
 * Handles the M-Pesa validation endpoint.
 */
const validateTransaction = (req, res) => {
    logger_1.default.info("M-Pesa Validation Request Received:", req.body);
    res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
};
exports.validateTransaction = validateTransaction;
/**
 * Handles the M-Pesa callback (confirmation).
 */
const callbackHandler = (req, res) => {
    logger_1.default.info("M-Pesa Callback Received:", req.body);
    res.status(200).json({ ResultCode: 0, ResultDesc: "Confirmation received and processed" });
};
exports.callbackHandler = callbackHandler;
//# sourceMappingURL=mpesaController.js.map