"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const userModel_1 = require("../models/userModel");
const responseHandlers_1 = require("../utils/responseHandlers");
const logger_1 = __importDefault(require("../utils/logger"));
dotenv_1.default.config();
/**
 * 🛡️ Middleware to protect routes using JWT
 */
const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return (0, responseHandlers_1.errorResponse)(res, 401, "Not authorized, no token provided.");
        }
        const token = authHeader.split(" ")[1];
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            logger_1.default.error("JWT_SECRET missing in environment variables.");
            return (0, responseHandlers_1.errorResponse)(res, 500, "Server configuration error.");
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // Fetch user from DB
        const user = await (0, userModel_1.findUserById)(decoded.id);
        if (!user) {
            logger_1.default.warn(`JWT ID ${decoded.id} not found in database.`);
            return (0, responseHandlers_1.errorResponse)(res, 401, "User not found, token invalid.");
        }
        // Attach user info to request
        req.user = { id: user.id, email: user.email };
        next();
    }
    catch (err) {
        logger_1.default.error("❌ JWT verification failed:", err.message);
        return (0, responseHandlers_1.errorResponse)(res, 401, "Not authorized, token failed or expired.");
    }
};
exports.protect = protect;
//# sourceMappingURL=authMiddleware.js.map