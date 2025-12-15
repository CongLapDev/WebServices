/**
 * Validation utilities
 */

/**
 * Validate tracking number format
 * Supports common Vietnamese shipping companies
 */
export const validateTrackingNumber = (trackingNumber) => {
    if (!trackingNumber || trackingNumber.trim() === '') {
        return {
            valid: false,
            message: 'Mã vận đơn không được để trống'
        };
    }

    const cleaned = trackingNumber.trim().toUpperCase();

    // GHN (Giao Hàng Nhanh): Format GHN + 9 digits
    if (/^GHN\d{9}$/.test(cleaned)) {
        return { valid: true, carrier: 'GHN' };
    }

    // GHTK (Giao Hàng Tiết Kiệm): Format starts with S
    if (/^S\d{8,12}$/.test(cleaned)) {
        return { valid: true, carrier: 'GHTK' };
    }

    // Viettel Post: Various formats
    if (/^[A-Z]{2}\d{9}VN$/.test(cleaned)) {
        return { valid: true, carrier: 'Viettel Post' };
    }

    // J&T Express: JT + numbers
    if (/^JT\d{10,13}$/.test(cleaned)) {
        return { valid: true, carrier: 'J&T Express' };
    }

    // Generic format: at least 6 characters
    if (cleaned.length >= 6) {
        return { 
            valid: true, 
            carrier: 'Other',
            warning: 'Định dạng không chuẩn, vui lòng kiểm tra lại'
        };
    }

    return {
        valid: false,
        message: 'Mã vận đơn không hợp lệ. Phải có ít nhất 6 ký tự.'
    };
};

/**
 * Get tracking URL by carrier
 */
export const getTrackingUrl = (trackingNumber, carrier) => {
    const cleaned = trackingNumber.trim().toUpperCase();
    
    switch (carrier) {
        case 'GHN':
            return `https://donhang.ghn.vn/?order_code=${cleaned}`;
        case 'GHTK':
            return `https://khachhang.giaohangtietkiem.vn/web/guest/progress?billcode=${cleaned}`;
        case 'Viettel Post':
            return `https://viettelpost.com.vn/thong-tin-don-hang?peopleTracking=${cleaned}`;
        case 'J&T Express':
            return `https://www.jtexpress.vn/tracklist?billcode=${cleaned}`;
        default:
            return null;
    }
};

/**
 * Suggest tracking number format
 */
export const getTrackingFormatHint = () => {
    return `
Định dạng phổ biến:
• GHN: GHN123456789
• GHTK: S12345678
• Viettel Post: AA123456789VN
• J&T Express: JT1234567890
    `.trim();
};

