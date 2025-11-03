import { Router, Request, Response } from "express";
import { register, login } from "../controllers/authController";
import { validateRegistration, validateLogin } from "../middleware/validators";

// Initialize the Express Router
const router = Router();

/* ===================================================================
 * 🧭 AUTH ROUTES
 * =================================================================== */

// POST /api/auth/register: Applies validation before calling the controller
router.post("/register", validateRegistration, register);

// POST /api/auth/login: Applies validation before calling the controller
router.post("/login", validateLogin, login);

/* ===================================================================
 * 🩺 HEALTH CHECK / DEBUG ROUTE
 * =================================================================== */

router.get("/status", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "✅ Auth routes operational",
    timestamp: new Date().toISOString(),
  });
});

/* ===================================================================
 * ⚙️ FALLBACK HANDLER
 * =================================================================== */

router.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Auth endpoint not found",
    path: _req.originalUrl,
  });
});

export default router;
