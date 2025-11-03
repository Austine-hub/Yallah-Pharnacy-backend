import express from "express";
import multer from "multer";
import { uploadPrescription } from "../controllers/prescriptionsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Temporary storage; consider cloud storage for production

/**
 * @route   POST /api/prescriptions
 * @desc    Upload a prescription file for an order
 * @access  Protected (JWT required)
 */
router.post("/", protect, upload.single("file"), uploadPrescription);

export default router;
