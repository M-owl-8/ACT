/**
 * Currency Formatter Utility
 * Formats amounts with appropriate currency symbols based on user's selected currency
 */

// Map currency codes to symbols
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  RUB: '₽',
  UZS: 'сўм',
};

/**
 * Get currency symbol for the given currency code
 * @param currency - Currency code (USD, EUR, RUB, UZS)
 * @returns Currency symbol
 */
export const getCurrencySymbol = (currency: string): string => {
  return CURRENCY_SYMBOLS[currency?.toUpperCase()] || '$';
};

/**
 * Format amount with currency symbol
 * Symbol appears BEFORE the number
 * @param amount - Numeric amount to format
 * @param currency - Currency code (USD, EUR, RUB, UZS)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string (e.g., "$ 1000.50", "₽ 5000.00")
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  decimals: number = 2
): string => {
  const symbol = getCurrencySymbol(currency);
  const formatted = amount.toFixed(decimals);
  return `${symbol} ${formatted}`;
};

/**
 * Format amount with currency symbol for display without decimal places
 * Useful for quick display where precision isn't critical
 * @param amount - Numeric amount to format
 * @param currency - Currency code (USD, EUR, RUB, UZS)
 * @returns Formatted string (e.g., "$ 1000", "₽ 5000")
 */
export const formatCurrencyNoDecimals = (
  amount: number,
  currency: string = 'USD'
): string => {
  const symbol = getCurrencySymbol(currency);
  const formatted = Math.round(amount);
  return `${symbol} ${formatted}`;
};