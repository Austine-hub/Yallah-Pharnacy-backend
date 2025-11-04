"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
(async () => {
    try {
        // Connect to your Railway database
        const connection = await promise_1.default.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            port: Number(process.env.DB_PORT),
            multipleStatements: true, // important for multi-line SQL dumps
        });
        console.log("✅ Connected to MySQL");
        // Step 1: Drop the users table if it exists (optional, for a clean setup)
        await connection.query("DROP TABLE IF EXISTS users;");
        // Step 2: Create table exactly as defined in your SQL dump
        await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT(11) NOT NULL AUTO_INCREMENT,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
    `);
        console.log("✅ users table created successfully");
        // Step 3: Insert your initial data (Ajanja account)
        await connection.query(`
      INSERT INTO users (id, username, email, password, created_at)
      VALUES
      (1, 'Ajanja', 'odhiamboaustine1@students.jkuat.ac.ke', 
      '$2b$10$tdqeJQBDlWzhC6Ef6uD0LOrDqRuoq8vlKamG7nNCLpuZsU3q3gY8K',
      '2025-11-02 02:05:44')
      ON DUPLICATE KEY UPDATE username = VALUES(username);
    `);
        console.log("✅ Sample data inserted successfully");
        await connection.end();
        console.log("🎯 Database initialized successfully");
    }
    catch (err) {
        console.error("❌ Error initializing database:", err);
    }
})();
//# sourceMappingURL=initDB.js.map