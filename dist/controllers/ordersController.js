"use strict";
// ordersController.ts (Harmonized Backend Code)
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPrescription = exports.createOrder = void 0;
const db_1 = __importDefault(require("../config/db"));
const logger_1 = __importDefault(require("../utils/logger"));
/* ============================================================
 * 🧩 Controller: Order Creation
 * ============================================================ */
/**
 * @route   POST /api/orders
 * @desc    Create a new order with order items, recalculating total on backend.
 * @access  Protected (JWT required)
 */
const createOrder = async (req, res) => {
    const userId = req.user?.id;
    // Use 'urban' as default if location is missing from JWT or not set
    const userLocation = req.user?.location || "urban";
    // Only destructure cartItems, allowing backend to recalculate totals
    const { cartItems } = req.body;
    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ success: false, message: "Cart items are required" });
    }
    try {
        // --- 1. RECALCULATE SUBTOTAL ---
        const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
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
        const [orderResult] = await db_1.default.query("INSERT INTO orders (user_id, subtotal, total, shipping) VALUES (?, ?, ?, ?)", [userId, subtotal, grandTotal, shipping]);
        const orderId = orderResult.insertId;
        // Prepare for batch insert of order items
        const itemValues = cartItems.map((item) => [
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
        await db_1.default.query(itemInsertQuery, itemValues.flat());
        // Return the correct, calculated values to the frontend
        res.status(201).json({ success: true, orderId, shipping, total: grandTotal, subtotal });
    }
    catch (err) {
        logger_1.default.error("Order creation failed:", err);
        res.status(500).json({ success: false, message: "Order creation failed. Check logs." });
    }
};
exports.createOrder = createOrder;
/* ============================================================
 * 🧩 Controller: Prescription Upload (NEWLY ADDED)
 * ============================================================ */
/**
 * @route   POST /api/prescriptions
 * @desc    Upload a prescription file for an order
 * @access  Protected (JWT required)
 */
const uploadPrescription = async (req, res) => {
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
        await db_1.default.query("INSERT INTO prescriptions (user_id, order_id, file_path) VALUES (?, ?, ?)", [userId, orderId, filePath]);
        logger_1.default.info(`Prescription uploaded for Order #${orderId} by User ${userId} at ${filePath}`);
        res.status(201).json({ success: true, message: "Prescription uploaded successfully" });
    }
    catch (err) {
        logger_1.default.error("Prescription upload failed:", err);
        res.status(500).json({ success: false, message: "Upload failed. Please try again." });
    }
};
exports.uploadPrescription = uploadPrescription;
//# sourceMappingURL=ordersController.js.map