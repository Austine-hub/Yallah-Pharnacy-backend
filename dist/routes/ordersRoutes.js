"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ordersController_1 = require("../controllers/ordersController"); // <-- Updated import
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware"); // <-- New import
const router = express_1.default.Router();
// 1. POST /api/orders: Create a new order (JSON data)
router.post("/", authMiddleware_1.protect, ordersController_1.createOrder);
/**
 * @route   POST /api/prescriptions
 * @desc    Upload a prescription file for an order (multipart/form-data)
 * @access  Protected (JWT required)
 */
router.post("/prescriptions", authMiddleware_1.protect, uploadMiddleware_1.uploadSinglePrescription, // <-- Multer middleware to handle file
ordersController_1.uploadPrescription // <-- Controller to save file path to DB
);
exports.default = router;
//# sourceMappingURL=ordersRoutes.js.map