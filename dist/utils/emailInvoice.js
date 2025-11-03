"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendInvoiceEmail = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
// ✅ Load environment variables
dotenv_1.default.config();
/**
 * Sends a PDF invoice via email using Nodemailer.
 */
const sendInvoiceEmail = async (user, orderId, cartItems, total) => {
    // ✅ Create a new PDF document
    const doc = new pdfkit_1.default();
    // Collect PDF chunks into a buffer
    const chunks = [];
    const pdfBufferPromise = new Promise((resolve) => {
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
    });
    // ✅ Generate the PDF content
    doc.fontSize(20).text(`Invoice for Order #${orderId}`, { align: "center" });
    doc.moveDown();
    cartItems.forEach((item) => {
        doc
            .fontSize(12)
            .text(`${item.name} x${item.quantity} — $${item.price.toFixed(2)}`);
    });
    doc.moveDown().fontSize(14).text(`Total: $${total.toFixed(2)}`);
    doc.end();
    // Wait for the PDF to finish generating
    const pdfBuffer = await pdfBufferPromise;
    // ✅ Configure Nodemailer transport securely using environment variables
    const transporter = nodemailer_1.default.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    // ✅ Send the email with attachment
    await transporter.sendMail({
        from: `"Yallah Pharmacy" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: `Your Order #${orderId} Invoice`,
        text: `Dear ${user.name || "Customer"},\n\nPlease find attached your invoice for Order #${orderId}.`,
        attachments: [
            {
                filename: `invoice-${orderId}.pdf`,
                content: pdfBuffer,
            },
        ],
    });
};
exports.sendInvoiceEmail = sendInvoiceEmail;
//# sourceMappingURL=emailInvoice.js.map