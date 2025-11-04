import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "pharmacy",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;

// ✅ Optional: test connection on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL connection successful!");
    connection.release();
  } catch (err) {
    if (err instanceof Error) {
      console.error("❌ MySQL Connection Error:", err.message);
    } else {
      console.error("❌ Unknown error during DB connection:", err);
    }
  }
})();
