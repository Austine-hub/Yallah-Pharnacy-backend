import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/responseHandlers"; // ⬅️ Harmonized with standardized error response

/* ============================================================
 * 🛡️ Validation Middleware
 * ============================================================ */

/**
 * Validate user registration input: username, email, and password requirements.
 */
export const validateRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    return errorResponse(res, 400, "All fields are required.");

  if (username.length < 3)
    return errorResponse(res, 400, "Username must be at least 3 characters long.");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return errorResponse(res, 400, "Invalid email format.");

  // Password length requirement
  if (password.length < 6)
    return errorResponse(res, 400, "Password must be at least 6 characters long.");

  // If all checks pass, move to the next middleware/controller
  next();
};

/**
 * Validate login input: email and password presence.
 */
export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  if (!email || !password)
    return errorResponse(res, 400, "Email and password are required.");

  // If validation passes, proceed
  next();
};