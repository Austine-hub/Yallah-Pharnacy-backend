import { Request, Response } from "express";
import db from "../config/db.js";
import logger from "../utils/logger.js";

// Extend Request to include 'user' from JWT and 'file' from multer
// NOTE: I am adding 'location' for type consistency with createOrder
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    location?: "urban" | "rural"; // Added for consistency with other controllers
  };
  file?: Express.Multer.File; // Added to properly type req.file
}

/**
 * @route   POST /api/prescriptions
 * @desc    Upload a prescription file for an order
 * @access  Protected (JWT required)
 */
export const uploadPrescription = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  
  // orderId comes from formData (sent by frontend)
  const orderId = req.body.orderId; 
  
  // filePath comes from req.file (processed by Multer middleware)
  const filePath = req.file?.path; 

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  // The check for filePath is sufficient since the frontend ensures a file is present
  if (!orderId || !filePath) {
    return res.status(400).json({ success: false, message: "Order ID and file are required" });
  }

  try {
    // Insert prescription record into DB
    await db.query(
      "INSERT INTO prescriptions (user_id, order_id, file_path) VALUES (?, ?, ?)",
      [userId, orderId, filePath]
    );

    logger.info(`Prescription uploaded for Order #${orderId} by User ${userId} at ${filePath}`);
    
    res.status(201).json({ success: true, message: "Prescription uploaded successfully" });
  } catch (err: any) {
    logger.error("Prescription upload failed:", err);
    res.status(500).json({ success: false, message: "Upload failed. Please try again." });
  }
};