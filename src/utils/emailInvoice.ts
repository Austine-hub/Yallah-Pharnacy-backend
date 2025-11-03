import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import dotenv from "dotenv";

// ✅ Load environment variables
dotenv.config();

/**
 * Sends a PDF invoice via email using Nodemailer.
 */
export const sendInvoiceEmail = async (
  user: { email: string; name?: string },
  orderId: number,
  cartItems: { name: string; quantity: number; price: number }[],
  total: number
): Promise<void> => {
  // ✅ Create a new PDF document
  const doc = new PDFDocument();

  // Collect PDF chunks into a buffer
  const chunks: Buffer[] = [];

  const pdfBufferPromise = new Promise<Buffer>((resolve) => {
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
  const transporter: Transporter = nodemailer.createTransport({
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
