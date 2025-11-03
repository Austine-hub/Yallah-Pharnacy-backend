"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDeliveryFee = void 0;
// Define constants for easy maintenance
const BASE_URBAN_SHIPPING = 250;
const BASE_RURAL_SHIPPING = 500;
const FREE_SHIPPING_THRESHOLD = 3000;
/**
 * Calculates the final delivery fee based on user location and order subtotal.
 * * @param location - The user's location ("urban" or "rural").
 * @param subtotal - The total price of all items in the cart (before shipping).
 * @returns The final shipping fee (0 for free shipping, or base rate).
 */
const calculateDeliveryFee = (location, subtotal) => {
    // 1. Check for Free Shipping
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
        return 0;
    }
    // 2. Apply Location-based Base Fee
    if (location === "rural") {
        return BASE_RURAL_SHIPPING;
    }
    // Default to urban rate for "urban" or any other value
    return BASE_URBAN_SHIPPING;
};
exports.calculateDeliveryFee = calculateDeliveryFee;
//# sourceMappingURL=deliveryFee.js.map