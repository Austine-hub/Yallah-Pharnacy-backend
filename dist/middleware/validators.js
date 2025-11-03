"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLogin = exports.validateRegistration = void 0;
const responseHandlers_1 = require("../utils/responseHandlers"); // ⬅️ Harmonized with standardized error response
/* ============================================================
 * 🛡️ Validation Middleware
 * ============================================================ */
/**
 * Validate user registration input: username, email, and password requirements.
 */
const validateRegistration = (req, res, next) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
        return (0, responseHandlers_1.errorResponse)(res, 400, "All fields are required.");
    if (username.length < 3)
        return (0, responseHandlers_1.errorResponse)(res, 400, "Username must be at least 3 characters long.");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
        return (0, responseHandlers_1.errorResponse)(res, 400, "Invalid email format.");
    // Password length requirement
    if (password.length < 6)
        return (0, responseHandlers_1.errorResponse)(res, 400, "Password must be at least 6 characters long.");
    // If all checks pass, move to the next middleware/controller
    next();
};
exports.validateRegistration = validateRegistration;
/**
 * Validate login input: email and password presence.
 */
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password)
        return (0, responseHandlers_1.errorResponse)(res, 400, "Email and password are required.");
    // If validation passes, proceed
    next();
};
exports.validateLogin = validateLogin;
//# sourceMappingURL=validators.js.map