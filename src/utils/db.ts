import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Ensure environment variables are loaded, though they should be loaded by the server file too.
dotenv.config();

/**
 * 💾 MySQL Connection Pool Configuration
 * Uses environment variables for credentials, falling back to secure defaults
 * for local development where possible.
 */
const pool = mysql.createPool({
  // Host, User, Pass, and DB Name are essential. Fallbacks provided for dev.
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  // Note: Using DB_PASS for consistency with previous file, although DB_PASSWORD is common
  password: process.env.DB_PASS || "", 
  database: process.env.DB_NAME || "pharmacy",
  
  // Connection Pool Optimization Settings
  waitForConnections: true, // Wait if the connection limit is reached
  connectionLimit: 10,      // Max number of connections in the pool
  queueLimit: 0,            // Unlimited queue size for waiting connections
});

export default pool; // Exporting as default for clean import in userModel.js