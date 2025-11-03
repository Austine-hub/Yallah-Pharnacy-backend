"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const validators_1 = require("../middleware/validators");
// Initialize the Express Router
const router = (0, express_1.Router)();
/* ===================================================================
 * 🧭 AUTH ROUTES
 * =================================================================== */
// POST /api/auth/register: Applies validation before calling the controller
router.post("/register", validators_1.validateRegistration, authController_1.register);
// POST /api/auth/login: Applies validation before calling the controller
router.post("/login", validators_1.validateLogin, authController_1.login);
/* ===================================================================
 * 🩺 HEALTH CHECK / DEBUG ROUTE
 * =================================================================== */
router.get("/status", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "✅ Auth routes operational",
        timestamp: new Date().toISOString(),
    });
});
/* ===================================================================
 * ⚙️ FALLBACK HANDLER
 * =================================================================== */
router.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: "Auth endpoint not found",
        path: _req.originalUrl,
    });
});
exports.default = router;
//# sourceMappingURL=authRoutes.js.map