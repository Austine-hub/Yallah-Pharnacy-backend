"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const userModel_1 = require("../models/userModel");
const responseHandlers_1 = require("../utils/responseHandlers");
const logger_1 = __importDefault(require("../utils/logger"));
dotenv_1.default.config();
/* ============================================================
 * 🔐 Helper: Generate JWT
 * ============================================================ */
const generateToken = (userId, email, location) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        logger_1.default.error("JWT_SECRET environment variable is missing.");
        throw new Error("Server configuration error.");
    }
    // ✅ Fix: Properly cast to jwt.StringValue
    const expiresIn = (process.env.JWT_EXPIRES_IN || "1d");
    return jsonwebtoken_1.default.sign({ sub: userId, email, location }, secret, { expiresIn });
};
/* ============================================================
 * 🧠 Controller: Register
 * ============================================================ */
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password)
            return (0, responseHandlers_1.errorResponse)(res, 400, "All fields are required.");
        const emailNormalized = email.trim().toLowerCase();
        const existingUser = await (0, userModel_1.findUserByEmail)(emailNormalized);
        if (existingUser)
            return (0, responseHandlers_1.errorResponse)(res, 409, "Email already registered.");
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const success = await (0, userModel_1.createUser)({
            username,
            email: emailNormalized,
            password: hashedPassword,
        });
        if (!success) {
            logger_1.default.error("[REGISTER] Failed to insert user in DB.");
            return (0, responseHandlers_1.errorResponse)(res, 500, "Failed to register user.");
        }
        logger_1.default.info(`[REGISTER] New user registered: ${emailNormalized}`);
        return (0, responseHandlers_1.successResponse)(res, "User registered successfully!");
    }
    catch (error) {
        logger_1.default.error("[REGISTER] Error:", error);
        return (0, responseHandlers_1.errorResponse)(res, 500, "Server error during registration.", error.message);
    }
};
exports.register = register;
/* ============================================================
 * 🔑 Controller: Login
 * ============================================================ */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return (0, responseHandlers_1.errorResponse)(res, 400, "Email and password are required.");
        const emailNormalized = email.trim().toLowerCase();
        const user = await (0, userModel_1.findUserByEmail)(emailNormalized);
        if (!user)
            return (0, responseHandlers_1.errorResponse)(res, 401, "Invalid credentials.");
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch)
            return (0, responseHandlers_1.errorResponse)(res, 401, "Invalid credentials.");
        const token = generateToken(user.id, user.email, user.location);
        const { password: _, ...userData } = user; // omit password
        logger_1.default.info(`[LOGIN] User logged in: ${emailNormalized}`);
        return (0, responseHandlers_1.successResponse)(res, "Login successful", { token, user: userData });
    }
    catch (error) {
        logger_1.default.error("[LOGIN] Error:", error);
        return (0, responseHandlers_1.errorResponse)(res, 500, "Server error during login.", error.message);
    }
};
exports.login = login;
//# sourceMappingURL=authController.js.map