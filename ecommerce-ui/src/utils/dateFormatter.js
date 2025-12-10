/**
 * Utility function to format dates consistently across the application
 * Handles both timestamp numbers (milliseconds) and date strings
 * 
 * @param {string|number|Date} dateValue - Date value (timestamp, ISO string, or Date object)
 * @param {string} format - Format string: 'dd/MM/yyyy', 'yyyy-MM-dd', or 'full'
 * @returns {string} Formatted date string or empty string if invalid
 */
export function formatDate(dateValue, format = 'dd/MM/yyyy') {
    if (!dateValue) return '';
    
    let date;
    
    // Handle different input types
    if (typeof dateValue === 'number') {
        // Timestamp (milliseconds)
        date = new Date(dateValue);
    } else if (typeof dateValue === 'string') {
        // ISO string or date string
        date = new Date(dateValue);
    } else if (dateValue instanceof Date) {
        date = dateValue;
    } else {
        return '';
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
        return '';
    }
    
    // Format based on requested format
    if (format === 'dd/MM/yyyy') {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    } else if (format === 'yyyy-MM-dd') {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
    } else if (format === 'full') {
        return date.toLocaleString();
    } else {
        // Default to dd/MM/yyyy
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
}

/**
 * Format date with time (for timestamps)
 * @param {string|number|Date} dateValue - Date value
 * @returns {string} Formatted date with time
 */
export function formatDateTime(dateValue) {
    if (!dateValue) return '';
    
    let date;
    
    if (typeof dateValue === 'number') {
        date = new Date(dateValue);
    } else if (typeof dateValue === 'string') {
        date = new Date(dateValue);
    } else if (dateValue instanceof Date) {
        date = dateValue;
    } else {
        return '';
    }
    
    if (isNaN(date.getTime())) {
        return '';
    }
    
    return date.toLocaleString();
}


