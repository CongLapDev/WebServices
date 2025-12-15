package com.nhs.individual.constant;

/**
 * Order Status Enum
 * 
 * Business Flow:
 * - COD:     PENDING_PAYMENT(skip) → CONFIRMED → PREPARING → SHIPPING → DELIVERED → COMPLETED
 * - Online:  PENDING_PAYMENT → PAID → CONFIRMED → PREPARING → SHIPPING → DELIVERED → COMPLETED
 * - Cancel:  PENDING_PAYMENT/PAID/CONFIRMED/PREPARING → CANCELLED
 * - Return:  DELIVERED/COMPLETED → RETURNED
 */
public enum OrderStatus {
    // Initial state - Order created, waiting for payment confirmation
    PENDING_PAYMENT(1, "PENDING_PAYMENT", "Chờ thanh toán"),
    
    // Payment received (for online payment only, COD skips this)
    PAID(2, "PAID", "Đã thanh toán"),
    
    // Order confirmed by admin/system (ready to process)
    CONFIRMED(3, "CONFIRMED", "Đã xác nhận"),
    
    // Warehouse is preparing order
    PREPARING(4, "PREPARING", "Đang chuẩn bị"),
    
    // Order is being shipped
    SHIPPING(5, "SHIPPING", "Đang giao hàng"),
    
    // Order delivered to customer
    DELIVERED(6, "DELIVERED", "Đã giao hàng"),
    
    // Order completed (customer confirmed/auto after N days)
    COMPLETED(7, "COMPLETED", "Hoàn thành"),
    
    // Order cancelled (before shipping)
    CANCELLED(8, "CANCELLED", "Đã hủy"),
    
    // Order returned (after delivery)
    RETURNED(9, "RETURNED", "Đã trả hàng");

    public final int id;
    public final String value;
    public final String description;
    
    OrderStatus(Integer id, String value, String description) {
        this.id = id;
        this.value = value;
        this.description = description;
    }
    
    /**
     * Check if this status represents a final state (no more transitions allowed)
     */
    public boolean isFinalState() {
        return this == COMPLETED || this == CANCELLED || this == RETURNED;
    }
    
    /**
     * Check if order can still be cancelled
     */
    public boolean isCancellable() {
        return this.id < SHIPPING.id && !isFinalState();
    }
    
    /**
     * Check if order can be returned
     */
    public boolean isReturnable() {
        return this == DELIVERED || this == COMPLETED;
    }
}
