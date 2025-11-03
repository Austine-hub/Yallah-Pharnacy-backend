"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const prescriptionsController_js_1 = require("../controllers/prescriptionsController.js");
const authMiddleware_js_1 = require("../middleware/authMiddleware.js");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ dest: "uploads/" }); // Temporary storage; consider cloud storage for production
/**
 * @route   POST /api/prescriptions
 * @desc    Upload a prescription file for an order
 * @access  Protected (JWT required)
 */
router.post("/", authMiddleware_js_1.protect, upload.single("file"), prescriptionsController_js_1.uploadPrescription);
exports.default = router;
//# sourceMappingURL=prescriptionsRoutes.js.map