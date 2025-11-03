"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.successResponse = void 0;
/* ============================================================
 * 🧩 Standardized Response Helpers
 * ============================================================ */
/**
 * Standardized success response helper.
 *
 * @param {Response} res - Express response object.
 * @param {string} message - A brief, successful message for the client.
 * @param {Record<string, any>} [data={}] - Optional payload data to include (e.g., token, user object).
 * @returns {Response} A JSON response with status 200.
 */
const successResponse = (res, message, data = {}) => res.status(200).json({
    success: true,
    message,
    ...data,
});
exports.successResponse = successResponse;
/**
 * Standardized error response helper.
 *
 * @param {Response} res - Express response object.
 * @param {number} statusCode - HTTP status code (e.g., 400, 401, 409).
 * @param {string} message - A brief, descriptive error message.
 * @param {any} [details] - Optional raw error details for logging/debugging in development.
 * @returns {Response} A JSON error response with the specified status code.
 */
const errorResponse = (res, statusCode, message, details) => res.status(statusCode).json({
    success: false,
    error: message,
    // Include raw details only in development mode for security
    ...(process.env.NODE_ENV === "development" && details ? { details } : {}),
});
exports.errorResponse = errorResponse;
//# sourceMappingURL=responseHandlers.js.map