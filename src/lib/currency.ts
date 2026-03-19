// Currency configuration
export const CURRENCY = 'INR'; // Change this to 'USD' for dollars, 'EUR' for euros, etc.
export const CURRENCY_SYMBOL = '₹';
export const LOCALE = 'en-IN'; // Indian locale for number formatting

/**
 * Format price in Indian Rupees
 * @param amount - Amount in rupees
 * @returns Formatted price string (e.g., "₹2,500")
 */
export const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format price with decimals (for detailed views)
 * @param amount - Amount in rupees
 * @returns Formatted price string with paise (e.g., "₹2,500.00")
 */
export const formatPriceDetailed = (amount: number): string => {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Convert USD to INR (if you have legacy USD prices)
 * @param usdAmount - Amount in USD
 * @param exchangeRate - Exchange rate (default: 83 INR per USD)
 * @returns Amount in INR
 */
export const convertUSDtoINR = (usdAmount: number, exchangeRate: number = 83): number => {
  return Math.round(usdAmount * exchangeRate);
};

/**
 * Parse formatted price back to number
 * @param formattedPrice - Formatted price string (e.g., "₹2,500")
 * @returns Numeric value
 */
export const parsePrice = (formattedPrice: string): number => {
  // Remove currency symbol and commas, then parse
  const numericString = formattedPrice.replace(/[^\d.]/g, '');
  return parseFloat(numericString) || 0;
};
