"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPrescription = void 0;
const db_js_1 = __importDefault(require("../config/db.js"));
const logger_js_1 = __importDefault(require("../utils/logger.js"));
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
        return res.status(400).json({ success: false, message: "Order ID and file are required" });
    }
    try {
        // Insert prescription record into DB
        await db_js_1.default.query("INSERT INTO prescriptions (user_id, order_id, file_path) VALUES (?, ?, ?)", [userId, orderId, filePath]);
        logger_js_1.default.info(`Prescription uploaded for Order #${orderId} by User ${userId} at ${filePath}`);
        res.status(201).json({ success: true, message: "Prescription uploaded successfully" });
    }
    catch (err) {
        logger_js_1.default.error("Prescription upload failed:", err);
        res.status(500).json({ success: false, message: "Upload failed. Please try again." });
    }
};
exports.uploadPrescription = uploadPrescription;
//# sourceMappingURL=prescriptionsController.js.map