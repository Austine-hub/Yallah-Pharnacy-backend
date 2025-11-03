"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Use process.cwd() for pathing relative to the project root, 
// which is safer than relying on __dirname in module environments.
const rootDir = process.cwd();
const logDir = path_1.default.join(rootDir, "logs");
// ✅ Ensure logs directory exists
if (!fs_1.default.existsSync(logDir)) {
    fs_1.default.mkdirSync(logDir, { recursive: true }); // Use recursive option for safer directory creation
}
// Define the log format for files
const fileFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.default.format.json() // Use JSON format for file logs for easy parsing by log analysis tools
);
// Define the log format for the console
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({ format: "HH:mm:ss" }), winston_1.default.format.printf((info) => `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`));
// ✅ Winston logger configuration
const logger = winston_1.default.createLogger({
    level: process.env.NODE_ENV === "development" ? "debug" : "info", // Higher verbosity in dev
    format: fileFormat, // Default format for file transports
    defaultMeta: { service: "pharmacy-api" }, // Add context to logs
    transports: [
        // 1. Log to the general application file
        new winston_1.default.transports.File({
            filename: path_1.default.join(logDir, "app.log"),
            maxsize: 5242880, // 5MB max file size
            maxFiles: 5, // Keep 5 backup files
        }),
        // 2. Log errors to a separate, critical file
        new winston_1.default.transports.File({
            filename: path_1.default.join(logDir, "errors.log"),
            level: "error",
            maxsize: 5242880,
            maxFiles: 5,
        }),
    ],
});
// ✅ Log to console in development and test environments
if (process.env.NODE_ENV !== "production") {
    logger.add(new winston_1.default.transports.Console({
        format: consoleFormat,
        level: "debug", // Show all messages in console during development
    }));
}
exports.default = logger;
//# sourceMappingURL=logger.js.map