/**
 * Custom rounding function for IDR currency
 * Rules:
 * - If decimal < 0.5: round down to 0
 * - If decimal >= 0.5: round up to 1
 * 
 * @param {number} value - The value to round
 * @returns {number} - The rounded value with no decimals
 */
export const roundIDR = (value) => {
    if (value === null || value === undefined || String(value).trim() === '' || isNaN(value)) {
        return 0;
    }

    const numValue = parseFloat(value);
    // Standard rounding: 0.5 and above rounds up, below rounds down
    return Math.round(numValue);
};

/**
 * Format currency value based on currency code
 * For IDR: no decimals with custom rounding logic
 * For other currencies: 2 decimal places
 * 
 * @param {number} value - The value to format
 * @param {string} currencyCode - The currency code (e.g., 'IDR', 'USD', 'SGD')
 * @returns {string} - The formatted value
 */
export const formatCurrency = (value, currencyCode) => {
    if (value === null || value === undefined || isNaN(value)) {
        return '0.00';
    }

    const upperCurrency = (currencyCode || '').trim().toUpperCase();

    if (upperCurrency === 'IDR') {
        // For IDR, use custom rounding with no decimals
        return roundIDR(value).toFixed(0);
    } else {
        // For other currencies, use 2 decimal places
        return parseFloat(value).toFixed(2);
    }
};

/**
 * Round value based on currency code
 * For IDR: custom rounding logic with no decimals
 * For other currencies: standard rounding with 2 decimals
 * 
 * @param {number} value - The value to round
 * @param {string} currencyCode - The currency code (e.g., 'IDR', 'USD', 'SGD')
 * @returns {number} - The rounded value
 */
export const roundByCurrency = (value, currencyCode) => {
    if (value === null || value === undefined || isNaN(value)) {
        return 0;
    }

    const upperCurrency = (currencyCode || '').trim().toUpperCase();

    if (upperCurrency === 'IDR') {
        // For IDR, use custom rounding with no decimals
        return roundIDR(value);
    } else {
        // For other currencies, round to 2 decimal places
        return Math.round(parseFloat(value) * 100) / 100;
    }
};