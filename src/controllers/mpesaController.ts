import { Request, Response } from "express";
import axios, { AxiosError } from "axios";
import dotenv from "dotenv";
import { getAccessToken } from "../utils/mpesaAPI";
import { errorResponse, successResponse } from "../utils/responseHandlers";
import logger from "../utils/logger";

dotenv.config();

/**
 * Initiates an M-Pesa STK Push (Lipa na M-Pesa Online).
 */
export const initiateSTKPush = async (req: Request, res: Response): Promise<Response> => {
  const { amount, phone } = req.body;

  if (!amount || !phone) {
    return errorResponse(res, 400, "Amount and phone number are required for payment.");
  }

  if (typeof amount !== "number" || amount <= 0) {
    return errorResponse(res, 400, "Invalid amount. Must be a positive number.");
  }

  try {
    const accessToken = await getAccessToken();

    const timestamp = new Date()
      .toISOString()
      .replace(/[-T:.Z]/g, "")
      .substring(0, 14);

    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;

    if (!shortcode || !passkey) {
      throw new Error("M-Pesa Shortcode or Passkey environment variables are not set.");
    }

    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

    const mpesaResponse = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: process.env.CALLBACK_URL,
        AccountReference: "PharmacyPayment",
        TransactionDesc: "Payment for goods",
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    logger.info("✅ M-Pesa STK Push initiated successfully.", mpesaResponse.data);
    return successResponse(res, "STK push initiated. Awaiting confirmation.", mpesaResponse.data);
  } catch (error: unknown) {
    // Safely narrow down the error type
    if (axios.isAxiosError(error)) {
      logger.error("❌ M-Pesa STK Push Axios Error:", error.response?.data || error.message);
      return errorResponse(
        res,
        500,
        "Failed to initiate M-Pesa STK push.",
        error.response?.data || error.message
      );
    } else if (error instanceof Error) {
      logger.error("❌ M-Pesa STK Push General Error:", error.message);
      return errorResponse(res, 500, "Failed to initiate M-Pesa STK push.", error.message);
    } else {
      logger.error("❌ M-Pesa STK Push Unknown Error:", error);
      return errorResponse(res, 500, "An unknown error occurred during M-Pesa STK push.");
    }
  }
};

/**
 * Handles the M-Pesa validation endpoint.
 */
export const validateTransaction = (req: Request, res: Response) => {
  logger.info("M-Pesa Validation Request Received:", req.body);
  res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
};

/**
 * Handles the M-Pesa callback (confirmation).
 */
export const callbackHandler = (req: Request, res: Response) => {
  logger.info("M-Pesa Callback Received:", req.body);
  res.status(200).json({ ResultCode: 0, ResultDesc: "Confirmation received and processed" });
};
