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
    
    // Convert to GMT+7 (Asia/Ho_Chi_Minh) timezone for consistent display
    const options = {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    };
    
    const formatter = new Intl.DateTimeFormat('vi-VN', options);
    const parts = formatter.formatToParts(date);
    
    const day = parts.find(p => p.type === 'day')?.value || '00';
    const month = parts.find(p => p.type === 'month')?.value || '00';
    const year = parts.find(p => p.type === 'year')?.value || '0000';
    
    // Format based on requested format
    if (format === 'dd/MM/yyyy') {
        return `${day}/${month}/${year}`;
    } else if (format === 'yyyy-MM-dd') {
        return `${year}-${month}-${day}`;
    } else if (format === 'full') {
        // Format with time in GMT+7
        const timeOptions = {
            timeZone: 'Asia/Ho_Chi_Minh',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        const timeFormatter = new Intl.DateTimeFormat('vi-VN', timeOptions);
        const timeParts = timeFormatter.formatToParts(date);
        const hour = timeParts.find(p => p.type === 'hour')?.value || '00';
        const minute = timeParts.find(p => p.type === 'minute')?.value || '00';
        const second = timeParts.find(p => p.type === 'second')?.value || '00';
        return `${hour}:${minute}:${second} ${day}/${month}/${year}`;
    } else {
        // Default to dd/MM/yyyy
        return `${day}/${month}/${year}`;
    }
}

/**
 * Format date with time (for timestamps)
 * Converts to GMT+7 (Asia/Ho_Chi_Minh) timezone for consistent display
 * @param {string|number|Date} dateValue - Date value
 * @returns {string} Formatted date with time in GMT+7
 */
export function formatDateTime(dateValue) {
    if (!dateValue) return '';
    
    let date;
    
    if (typeof dateValue === 'number') {
        // Timestamp (milliseconds) - JavaScript Date constructor treats this as UTC milliseconds since epoch
        // This is correct - the timestamp represents a moment in time, not a local time
        date = new Date(dateValue);
    } else if (typeof dateValue === 'string') {
        // Handle ISO strings and date strings
        // If string ends with 'Z' or has timezone offset (+/-HH:MM), parse as-is
        // Otherwise, assume it's UTC and append 'Z' to force UTC parsing
        let dateString = dateValue.trim();
        
        // Check if string already has timezone info (Z, +HH:MM, or -HH:MM pattern)
        const hasTimezone = /[Zz]$/.test(dateString) || 
                           /[+-]\d{2}:\d{2}$/.test(dateString) ||
                           /[+-]\d{4}$/.test(dateString);
        
        // If it's an ISO string without timezone (e.g., "2025-12-17T13:25:07")
        // or MySQL datetime format (e.g., "2025-12-17 13:25:07"), treat as UTC
        if (!hasTimezone) {
            // MySQL datetime format: "YYYY-MM-DD HH:mm:ss" - replace space with T and add Z
            if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(dateString)) {
                dateString = dateString.replace(' ', 'T') + 'Z';
            } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(dateString)) {
                // ISO without timezone (may have milliseconds)
                dateString = dateString + 'Z';
            }
        }
        
        date = new Date(dateString);
    } else if (dateValue instanceof Date) {
        date = dateValue;
    } else {
        return '';
    }
    
    if (isNaN(date.getTime())) {
        console.warn('Invalid date value:', dateValue);
        return '';
    }
    
    // Debug: Log the date object to verify
    console.log('formatDateTime - Input:', dateValue, 'Parsed Date (UTC):', date.toISOString(), 'Local:', date.toString());
    
    // Convert to GMT+7 (Asia/Ho_Chi_Minh) timezone
    // Format: HH:mm:ss dd/MM/yyyy
    // Using 'en-US' locale to ensure consistent formatting, then manually format
    const options = {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    
    // Use 'en-US' locale to get consistent part types, then format manually
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(date);
    
    // Debug: Log parts to see what we're getting
    console.log('formatDateTime - Parts:', parts);
    
    // Extract parts - Intl.DateTimeFormat uses specific part types
    // Ensure we handle undefined values properly
    const hourPart = parts.find(p => p.type === 'hour');
    const minutePart = parts.find(p => p.type === 'minute');
    const secondPart = parts.find(p => p.type === 'second');
    const dayPart = parts.find(p => p.type === 'day');
    const monthPart = parts.find(p => p.type === 'month');
    const yearPart = parts.find(p => p.type === 'year');
    
    const hour = (hourPart?.value || '00').padStart(2, '0');
    const minute = (minutePart?.value || '00').padStart(2, '0');
    const second = (secondPart?.value || '00').padStart(2, '0');
    const day = (dayPart?.value || '00').padStart(2, '0');
    const month = (monthPart?.value || '00').padStart(2, '0');
    const year = yearPart?.value || '0000';
    
    // Debug: Log the formatted result
    const result = `${hour}:${minute}:${second} ${day}/${month}/${year}`;
    console.log('formatDateTime - Formatted (GMT+7):', result, 'UTC equivalent:', date.toISOString());
    
    // Format: HH:mm:ss dd/MM/yyyy
    return result;
}