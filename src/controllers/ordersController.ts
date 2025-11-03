// ordersController.ts (Harmonized Backend Code)

import { Request, Response } from "express";
import db from "../config/db";
import logger from "../utils/logger";

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

// Define Cart Item structure for type safety
interface CartItem {
  productId: string; // Assuming 'id' in frontend is 'productId' in backend
  quantity: number;
  price: number; // Item price at time of order
}

/* ============================================================
 * 🧩 Controller: Order Creation
 * ============================================================ */

/**
 * @route   POST /api/orders
 * @desc    Create a new order with order items, recalculating total on backend.
 * @access  Protected (JWT required)
 */
export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  // Use 'urban' as default if location is missing from JWT or not set
  const userLocation = req.user?.location || "urban"; 

  // Only destructure cartItems, allowing backend to recalculate totals
  const { cartItems }: { cartItems: CartItem[] } = req.body;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ success: false, message: "Cart items are required" });
  }

  try {
    // --- 1. RECALCULATE SUBTOTAL ---
    const subtotal = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity, 0
    );

    // --- 2. RECALCULATE SHIPPING (Backend is the source of truth) ---
    const BASE_URBAN_SHIPPING = 250;
    const BASE_RURAL_SHIPPING = 500;
    const FREE_SHIPPING_THRESHOLD = 3000;

    let shipping = 0;
    if (subtotal < FREE_SHIPPING_THRESHOLD) {
      shipping = userLocation === "urban" ? BASE_URBAN_SHIPPING : BASE_RURAL_SHIPPING;
    }
    
    // --- 3. CALCULATE GRAND TOTAL ---
    const grandTotal = subtotal + shipping;

    // Insert into orders table
    const [orderResult]: any = await db.query(
      "INSERT INTO orders (user_id, subtotal, total, shipping) VALUES (?, ?, ?, ?)",
      [userId, subtotal, grandTotal, shipping] 
    );

    const orderId = orderResult.insertId;

    // Prepare for batch insert of order items
    const itemValues = cartItems.map((item: CartItem) => [
      orderId, 
      item.productId, 
      item.quantity, 
      item.price
    ]);
    
    // Insert all order items
    const itemInsertQuery = `
      INSERT INTO order_items (order_id, product_id, quantity, price)
      VALUES ${itemValues.map(() => "(?, ?, ?, ?)").join(", ")}
    `;

    await db.query(itemInsertQuery, itemValues.flat());
    
    // Return the correct, calculated values to the frontend
    res.status(201).json({ success: true, orderId, shipping, total: grandTotal, subtotal });
  } catch (err: any) {
    logger.error("Order creation failed:", err);
    res.status(500).json({ success: false, message: "Order creation failed. Check logs." });
  }
};

/* ============================================================
 * 🧩 Controller: Prescription Upload (NEWLY ADDED)
 * ============================================================ */

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
    // If Multer fails, it throws an error, so this handles missing orderId or other issues
    return res.status(400).json({ success: false, message: "Order ID and file are required" });
  }

  try {
    // Insert prescription record into DB (linked to the order_id)
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