import winston from "winston";
import path from "path";
import fs from "fs";

// Use process.cwd() for pathing relative to the project root, 
// which is safer than relying on __dirname in module environments.
const rootDir = process.cwd();
const logDir = path.join(rootDir, "logs");

// ✅ Ensure logs directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true }); // Use recursive option for safer directory creation
}

// Define the log format for files
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.json() // Use JSON format for file logs for easy parsing by log analysis tools
);

// Define the log format for the console
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(
    (info) => `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`
  )
);

// ✅ Winston logger configuration
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "development" ? "debug" : "info", // Higher verbosity in dev
  format: fileFormat, // Default format for file transports
  defaultMeta: { service: "pharmacy-api" }, // Add context to logs
  transports: [
    // 1. Log to the general application file
    new winston.transports.File({ 
      filename: path.join(logDir, "app.log"),
      maxsize: 5242880, // 5MB max file size
      maxFiles: 5,      // Keep 5 backup files
    }),
    
    // 2. Log errors to a separate, critical file
    new winston.transports.File({
      filename: path.join(logDir, "errors.log"),
      level: "error",
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// ✅ Log to console in development and test environments
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
      level: "debug", // Show all messages in console during development
    })
  );
}

export default logger;