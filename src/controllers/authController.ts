import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";
import dotenv from "dotenv";

import { createUser, findUserByEmail } from "../models/userModel";
import { errorResponse, successResponse } from "../utils/responseHandlers";
import logger from "../utils/logger";

dotenv.config();

/* ============================================================
 * 🧩 User Type Definition
 * ============================================================ */
interface User {
  id?: number;
  username: string;
  email: string;
  password: string;
  location?: "urban" | "rural";
}

/* ============================================================
 * 🔐 Helper: Generate JWT
 * ============================================================ */
const generateToken = (userId: number, email: string, location?: string): string => {
  const secret = process.env.JWT_SECRET as Secret;
  if (!secret) {
    logger.error("JWT_SECRET environment variable is missing.");
    throw new Error("Server configuration error.");
  }

  // ✅ Fix: Properly cast to jwt.StringValue
  const expiresIn = (process.env.JWT_EXPIRES_IN || "1d") as unknown as jwt.SignOptions["expiresIn"];

  return jwt.sign({ sub: userId, email, location }, secret, { expiresIn });
};

/* ============================================================
 * 🧠 Controller: Register
 * ============================================================ */
export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return errorResponse(res, 400, "All fields are required.");

    const emailNormalized = email.trim().toLowerCase();
    const existingUser = await findUserByEmail(emailNormalized);

    if (existingUser)
      return errorResponse(res, 409, "Email already registered.");

    const hashedPassword = await bcrypt.hash(password, 12);
    const success = await createUser({
      username,
      email: emailNormalized,
      password: hashedPassword,
    });

    if (!success) {
      logger.error("[REGISTER] Failed to insert user in DB.");
      return errorResponse(res, 500, "Failed to register user.");
    }

    logger.info(`[REGISTER] New user registered: ${emailNormalized}`);
    return successResponse(res, "User registered successfully!");
  } catch (error: any) {
    logger.error("[REGISTER] Error:", error);
    return errorResponse(res, 500, "Server error during registration.", error.message);
  }
};

/* ============================================================
 * 🔑 Controller: Login
 * ============================================================ */
export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return errorResponse(res, 400, "Email and password are required.");

    const emailNormalized = email.trim().toLowerCase();
    const user: User | null = await findUserByEmail(emailNormalized);

    if (!user)
      return errorResponse(res, 401, "Invalid credentials.");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return errorResponse(res, 401, "Invalid credentials.");

    const token = generateToken(user.id!, user.email, user.location);
    const { password: _, ...userData } = user; // omit password

    logger.info(`[LOGIN] User logged in: ${emailNormalized}`);
    return successResponse(res, "Login successful", { token, user: userData });
  } catch (error: any) {
    logger.error("[LOGIN] Error:", error);
    return errorResponse(res, 500, "Server error during login.", error.message);
  }
};





