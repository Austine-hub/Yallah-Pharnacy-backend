"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserById = exports.findUserByUsername = exports.findUserByEmail = exports.createUser = void 0;
const db_1 = __importDefault(require("../config/db"));
const logger_1 = __importDefault(require("../utils/logger")); // ⬅️ Integrated logger
/* ============================================================
 * 🧩 Model Functions
 * ============================================================ */
/**
 * Creates a new user record in the database.
 * @param user - User object containing username, email, and hashedPassword.
 * @returns Promise<boolean> - True if the user was created successfully.
 */
const createUser = async (user) => {
    try {
        const sql = `
      INSERT INTO users (username, email, password)
      VALUES (?, ?, ?)
    `;
        const params = [user.username, user.email, user.password];
        const [result] = await db_1.default.query(sql, params);
        // Check if the insert was successful
        return result.affectedRows > 0;
    }
    catch (error) {
        logger_1.default.error("❌ Error creating user:", error);
        // Throw a generic database error to be caught by the controller
        throw new Error("Database error while creating user");
    }
};
exports.createUser = createUser;
/**
 * Finds a user by their email address.
 * @param email - The user's email address.
 * @returns Promise<User | null> - The user object or null if not found.
 */
const findUserByEmail = async (email) => {
    try {
        const sql = `SELECT * FROM users WHERE email = ? LIMIT 1`;
        const [rows] = await db_1.default.query(sql, [email]);
        return rows.length > 0 ? rows[0] : null;
    }
    catch (error) {
        logger_1.default.error("❌ Error finding user by email:", error);
        throw new Error("Database error while fetching user by email");
    }
};
exports.findUserByEmail = findUserByEmail;
/**
 * Finds a user by their username.
 * @param username - The user's username.
 * @returns Promise<User | null> - The user object or null if not found.
 */
const findUserByUsername = async (username) => {
    try {
        const sql = `SELECT * FROM users WHERE username = ? LIMIT 1`;
        const [rows] = await db_1.default.query(sql, [username]);
        return rows.length > 0 ? rows[0] : null;
    }
    catch (error) {
        logger_1.default.error("❌ Error finding user by username:", error);
        throw new Error("Database error while fetching user by username");
    }
};
exports.findUserByUsername = findUserByUsername;
/**
 * Finds a user by their ID.
 * @param id - The user's primary key ID.
 * @returns Promise<User | null> - The user object or null if not found.
 */
const findUserById = async (id) => {
    try {
        const sql = `SELECT * FROM users WHERE id = ? LIMIT 1`;
        const [rows] = await db_1.default.query(sql, [id]);
        return rows.length > 0 ? rows[0] : null;
    }
    catch (error) {
        logger_1.default.error("❌ Error finding user by ID:", error);
        throw new Error("Database error while fetching user by ID");
    }
};
exports.findUserById = findUserById;
//# sourceMappingURL=userModel.js.map