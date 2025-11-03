import express from "express";
import { createOrder, uploadPrescription } from "../controllers/ordersController"; // <-- Updated import
import { protect } from "../middleware/authMiddleware";
import { uploadSinglePrescription } from "../middleware/uploadMiddleware"; // <-- New import

const router = express.Router();

// 1. POST /api/orders: Create a new order (JSON data)
router.post("/", protect, createOrder);

/**
 * @route   POST /api/prescriptions
 * @desc    Upload a prescription file for an order (multipart/form-data)
 * @access  Protected (JWT required)
 */
router.post(
    "/prescriptions", 
    protect, 
    uploadSinglePrescription, // <-- Multer middleware to handle file
    uploadPrescription        // <-- Controller to save file path to DB
);

export default router;