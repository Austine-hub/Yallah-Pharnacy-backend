import { Request, Response, NextFunction } from "express";
import jwt, { Secret } from "jsonwebtoken";
import dotenv from "dotenv";
import { findUserById } from "../models/userModel";
import { errorResponse } from "../utils/responseHandlers";
import logger from "../utils/logger";

dotenv.config();

// Extend Request to include user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

/**
 * 🛡️ Middleware to protect routes using JWT
 */
export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(res, 401, "Not authorized, no token provided.");
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET as Secret;

    if (!secret) {
      logger.error("JWT_SECRET missing in environment variables.");
      return errorResponse(res, 500, "Server configuration error.");
    }

    // Verify token
    const decoded = jwt.verify(token, secret) as { id: number };

    // Fetch user from DB
    const user = await findUserById(decoded.id);
    if (!user) {
      logger.warn(`JWT ID ${decoded.id} not found in database.`);
      return errorResponse(res, 401, "User not found, token invalid.");
    }

    // Attach user info to request
    req.user = { id: user.id!, email: user.email };
    next();

  } catch (err: any) {
    logger.error("❌ JWT verification failed:", err.message);
    return errorResponse(res, 401, "Not authorized, token failed or expired.");
  }
};
