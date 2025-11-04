"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pool = promise_1.default.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "pharmacy",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
exports.default = pool;
// ✅ Optional: test connection on startup
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log("✅ MySQL connection successful!");
        connection.release();
    }
    catch (err) {
        if (err instanceof Error) {
            console.error("❌ MySQL Connection Error:", err.message);
        }
        else {
            console.error("❌ Unknown error during DB connection:", err);
        }
    }
})();
//# sourceMappingURL=db.js.map