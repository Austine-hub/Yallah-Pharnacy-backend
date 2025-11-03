import axios from "axios";
import dotenv from "dotenv";
import logger from "./logger"; // ⬅️ Integrated logger

dotenv.config();

/**
 * Retrieves the M-Pesa OAuth Access Token from Safaricom.
 * @returns {Promise<string>} The generated access token.
 * @throws {Error} If the required environment variables are missing or the API call fails.
 */
export const getAccessToken = async (): Promise<string> => {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    logger.error("MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET is not set.");
    throw new Error("M-Pesa API credentials are not configured.");
  }

  // Determine URL based on environment (best practice)
  const isSandbox = process.env.NODE_ENV === "development";
  const baseUrl = isSandbox
    ? "https://sandbox.safaricom.co.ke"
    : "https://api.safaricom.co.ke";
  
  const url = `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`;

  try {
    // Basic Auth header generation
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
    
    logger.debug("Requesting M-Pesa Access Token...");
    
    const res = await axios.get(url, { 
      headers: { 
        Authorization: `Basic ${auth}`,
        // Add content-type header even for GET, though less critical
        "Content-Type": "application/json" 
      } 
    });

    if (res.data && res.data.access_token) {
      logger.info("M-Pesa Access Token successfully retrieved.");
      return res.data.access_token;
    } else {
      // Handle response without a token
      throw new Error("M-Pesa API responded without an access token.");
    }
  } catch (error: any) {
    logger.error("❌ M-Pesa Access Token Error:", error.response?.data || error.message);
    throw new Error("Failed to retrieve M-Pesa access token.");
  }
};