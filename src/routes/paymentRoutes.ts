import { Router, Request, Response } from "express";
import {
  initiateSTKPush,
  validateTransaction,
  callbackHandler,
} from "../controllers/mpesaController";
import { protect } from "../middleware/authMiddleware"; // 🔒 Protect sensitive routes

const router = Router();

/* ===================================================================
 * 🧭 M-PESA PAYMENT ROUTES
 * =================================================================== */

/**
 * @route   POST /stkpush
 * @desc    Initiate Lipa Na M-Pesa Online push request.
 * @access  Protected (Requires JWT)
 */
router.post("/stkpush", protect, initiateSTKPush);

/**
 * @route   POST /validation
 * @desc    Safaricom validation URL for C2B transactions.
 * @access  Public (Safaricom calls this)
 */
router.post("/validation", validateTransaction);

/**
 * @route   POST /callback
 * @desc    Safaricom confirmation URL for C2B transactions.
 * @access  Public (Safaricom calls this)
 */
router.post("/callback", callbackHandler);

/* ===================================================================
 * ⚙️ FALLBACK HANDLER (FOR UNDEFINED ROUTES)
 * =================================================================== */

router.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Payment endpoint not found",
    path: req.originalUrl,
  });
});

export default router;
