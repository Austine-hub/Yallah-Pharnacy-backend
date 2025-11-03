"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mpesaController_1 = require("../controllers/mpesaController");
const authMiddleware_1 = require("../middleware/authMiddleware"); // 🔒 Protect sensitive routes
const router = (0, express_1.Router)();
/* ===================================================================
 * 🧭 M-PESA PAYMENT ROUTES
 * =================================================================== */
/**
 * @route   POST /stkpush
 * @desc    Initiate Lipa Na M-Pesa Online push request.
 * @access  Protected (Requires JWT)
 */
router.post("/stkpush", authMiddleware_1.protect, mpesaController_1.initiateSTKPush);
/**
 * @route   POST /validation
 * @desc    Safaricom validation URL for C2B transactions.
 * @access  Public (Safaricom calls this)
 */
router.post("/validation", mpesaController_1.validateTransaction);
/**
 * @route   POST /callback
 * @desc    Safaricom confirmation URL for C2B transactions.
 * @access  Public (Safaricom calls this)
 */
router.post("/callback", mpesaController_1.callbackHandler);
/* ===================================================================
 * ⚙️ FALLBACK HANDLER (FOR UNDEFINED ROUTES)
 * =================================================================== */
router.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "Payment endpoint not found",
        path: req.originalUrl,
    });
});
exports.default = router;
//# sourceMappingURL=paymentRoutes.js.map