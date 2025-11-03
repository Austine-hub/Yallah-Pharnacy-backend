import multerPkg, { FileFilterCallback } from "multer";
const multer = (multerPkg as any).default || multerPkg;
import path from "path";
import type { Request } from "express";
import fs from "fs";

// ✅ Automatically create the upload directory if it doesn’t exist
const uploadDir = "uploads/prescriptions";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Configure storage destination and file naming
const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, uploadDir);
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const orderId = req.body?.orderId || "temp";
    const fileExt = path.extname(file.originalname);
    cb(null, `${orderId}-${Date.now()}${fileExt}`);
  },
});

// ✅ Filter to allow only specific file types
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
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
export const uploadSinglePrescription = upload.single("file");
