"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_js_1 = __importDefault(require("../utils/logger.js"));
/**
 * 🧯 Global Error Handling Middleware
 * Must be defined with four parameters (err, req, res, next) for Express to recognize it.
 *
 * @param {any} err - The error object passed by Express or thrown in a controller.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function (unused here as it's the final handler).
 * @returns {Response} A JSON error response to the client.
 */
const errorHandler = (err, req, res, next // Required parameter, even if unused
) => {
    // Determine status code and message
    const statusCode = err.statusCode || 500;
    // Use a generic message for 500 errors in production for security
    const message = (statusCode === 500 && process.env.NODE_ENV === 'production')
        ? "Internal Server Error"
        : err.message || "Internal Server Error";
    // 🧾 Log detailed error info using the configured logger
    logger_js_1.default.error(`[ERROR] ${req.method} ${req.originalUrl} | Status: ${statusCode} | Message: ${message}`);
    // Log the stack trace only if available and in a development environment
    if (err.stack && process.env.NODE_ENV === 'development') {
        logger_js_1.default.error(`Stack Trace: ${err.stack}`);
    }
    // Send structured JSON error response to the client
    return res.status(statusCode).json({
        success: false,
        error: message,
        // Optionally include stack trace/details in dev environment
        ...(process.env.NODE_ENV === 'development' && { details: err.stack }),
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map