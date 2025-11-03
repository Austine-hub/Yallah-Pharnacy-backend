import { RowDataPacket, ResultSetHeader } from "mysql2";
import pool from "../config/db";
import logger from "../utils/logger"; // ⬅️ Integrated logger

/* ============================================================
 * 📦 Type Definitions
 * ============================================================ */

/**
 * Interface defining the structure of a User record in the database.
 */
export interface User {
  id?: number;
  username: string;
  email: string;
  password: string; // Stored as a hash in the database
  created_at?: Date;
}

/* ============================================================
 * 🧩 Model Functions
 * ============================================================ */

/**
 * Creates a new user record in the database.
 * @param user - User object containing username, email, and hashedPassword.
 * @returns Promise<boolean> - True if the user was created successfully.
 */
export const createUser = async (user: User): Promise<boolean> => {
  try {
    const sql = `
      INSERT INTO users (username, email, password)
      VALUES (?, ?, ?)
    `;
    const params = [user.username, user.email, user.password];
    const [result] = await pool.query<ResultSetHeader>(sql, params);

    // Check if the insert was successful
    return result.affectedRows > 0;
  } catch (error) {
    logger.error("❌ Error creating user:", error);
    // Throw a generic database error to be caught by the controller
    throw new Error("Database error while creating user");
  }
};

/**
 * Finds a user by their email address.
 * @param email - The user's email address.
 * @returns Promise<User | null> - The user object or null if not found.
 */
export const findUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const sql = `SELECT * FROM users WHERE email = ? LIMIT 1`;
    const [rows] = await pool.query<RowDataPacket[]>(sql, [email]);
    return rows.length > 0 ? (rows[0] as User) : null;
  } catch (error) {
    logger.error("❌ Error finding user by email:", error);
    throw new Error("Database error while fetching user by email");
  }
};

/**
 * Finds a user by their username.
 * @param username - The user's username.
 * @returns Promise<User | null> - The user object or null if not found.
 */
export const findUserByUsername = async (username: string): Promise<User | null> => {
  try {
    const sql = `SELECT * FROM users WHERE username = ? LIMIT 1`;
    const [rows] = await pool.query<RowDataPacket[]>(sql, [username]);
    return rows.length > 0 ? (rows[0] as User) : null;
  } catch (error) {
    logger.error("❌ Error finding user by username:", error);
    throw new Error("Database error while fetching user by username");
  }
};

/**
 * Finds a user by their ID.
 * @param id - The user's primary key ID.
 * @returns Promise<User | null> - The user object or null if not found.
 */
export const findUserById = async (id: number): Promise<User | null> => {
  try {
    const sql = `SELECT * FROM users WHERE id = ? LIMIT 1`;
    const [rows] = await pool.query<RowDataPacket[]>(sql, [id]);
    return rows.length > 0 ? (rows[0] as User) : null;
  } catch (error) {
    logger.error("❌ Error finding user by ID:", error);
    throw new Error("Database error while fetching user by ID");
  }
};