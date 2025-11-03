"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSinglePrescription = void 0;
const multer_1 = __importDefault(require("multer"));
const multer = multer_1.default.default || multer_1.default;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// ✅ Automatically create the upload directory if it doesn’t exist
const uploadDir = "uploads/prescriptions";
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// ✅ Configure storage destination and file naming
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const orderId = req.body?.orderId || "temp";
        const fileExt = path_1.default.extname(file.originalname);
        cb(null, `${orderId}-${Date.now()}${fileExt}`);
    },
});
// ✅ Filter to allow only specific file types
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error("Invalid file type. Only JPEG, PNG, and PDF are allowed."));
    }
};
// ✅ Multer upload instance
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter,
});
// ✅ Export single file upload handler
exports.uploadSinglePrescription = upload.single("file");
//# sourceMappingURL=uploadMiddleware.js.map