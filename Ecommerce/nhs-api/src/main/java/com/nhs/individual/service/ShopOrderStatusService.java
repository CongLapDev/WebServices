package com.nhs.individual.service;

import com.nhs.individual.config.OrderStateMachine;
import com.nhs.individual.constant.OrderStatus;
import com.nhs.individual.domain.ShopOrder;
import com.nhs.individual.domain.ShopOrderStatus;
import com.nhs.individual.exception.InvalidOrderStatusTransitionException;
import com.nhs.individual.exception.OrderNotFoundException;
import com.nhs.individual.repository.ShopOrderRepository;
import com.nhs.individual.repository.ShopOrderStatusRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service for managing order status transitions
 * Uses State Machine pattern to enforce business rules
 */
@Slf4j
@Service
@AllArgsConstructor
public class ShopOrderStatusService {
    
    private final ShopOrderStatusRepository statusRepository;
    private final ShopOrderRepository orderRepository;
    private final OrderStateMachine stateMachine;
    
    /**
     * Update order status with validation
     * 
     * @param orderId Order ID to update
     * @param newStatusEnum New status to set
     * @param note Optional note for this status change
     * @param detail Optional detail information
     * @return Updated ShopOrderStatus
     * @throws OrderNotFoundException if order doesn't exist
     * @throws InvalidOrderStatusTransitionException if transition is not allowed
     */
    @Transactional
    public ShopOrderStatus updateOrderStatus(Integer orderId, OrderStatus newStatusEnum, String note, String detail) {
        // 1. Verify order exists
        ShopOrder order = orderRepository.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException(orderId));
        
        // 2. Get current status
        Optional<ShopOrderStatus> currentStatusOpt = statusRepository.findCurrentStatusByOrderId(orderId);
        
        // 3. If no current status, this is initial status (should be PENDING_PAYMENT)
        if (currentStatusOpt.isEmpty()) {
            if (newStatusEnum != OrderStatus.PENDING_PAYMENT) {
                throw new InvalidOrderStatusTransitionException(
                    "New order must start with PENDING_PAYMENT status, got: " + newStatusEnum.description
                );
            }
            return createStatusRecord(order, newStatusEnum, note, detail);
        }
        
        // 4. Validate transition
        ShopOrderStatus currentStatus = currentStatusOpt.get();
        OrderStatus currentStatusEnum = getOrderStatusById(currentStatus.getStatus());
        
        if (currentStatusEnum == null) {
            throw new InvalidOrderStatusTransitionException(
                "Invalid current status ID: " + currentStatus.getStatus()
            );
        }
        
        // Check if transition is allowed
        if (!stateMachine.isTransitionAllowed(currentStatusEnum, newStatusEnum)) {
            String errorMessage = stateMachine.getTransitionErrorMessage(currentStatusEnum, newStatusEnum);
            log.warn("Invalid status transition attempt for order {}: {} -> {}",
                orderId, currentStatusEnum.value, newStatusEnum.value);
            throw new InvalidOrderStatusTransitionException(currentStatusEnum, newStatusEnum, errorMessage);
        }
        
        // 5. Create new status record
        log.info("Order {} status changed: {} -> {} by system",
            orderId, currentStatusEnum.value, newStatusEnum.value);
        
        return createStatusRecord(order, newStatusEnum, note, detail);
    }
    
    /**
     * Overload for backward compatibility
     */
    @Transactional
    public ShopOrderStatus updateOrderStatus(Integer orderId, ShopOrderStatus statusObj) {
        OrderStatus newStatus = getOrderStatusById(statusObj.getStatus());
        if (newStatus == null) {
            throw new InvalidOrderStatusTransitionException("Invalid status ID: " + statusObj.getStatus());
        }
        
        return updateOrderStatus(orderId, newStatus, statusObj.getNote(), statusObj.getDetail());
    }
    
    /**
     * Cancel an order
     * 
     * @param orderId Order ID to cancel
     * @param note Reason for cancellation
     * @return Updated ShopOrderStatus
     */
    @Transactional
    public ShopOrderStatus cancelOrder(Integer orderId, String note, String detail) {
        // Verify order exists
        ShopOrder order = orderRepository.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException(orderId));
        
        // Get current status
        ShopOrderStatus currentStatus = statusRepository.findCurrentStatusByOrderId(orderId)
            .orElseThrow(() -> new InvalidOrderStatusTransitionException(
                "Cannot cancel order: no status history found"
            ));
        
        OrderStatus currentStatusEnum = getOrderStatusById(currentStatus.getStatus());
        
        // Check if order can be cancelled
        if (currentStatusEnum == null || !currentStatusEnum.isCancellable()) {
            throw new InvalidOrderStatusTransitionException(
                currentStatusEnum,
                OrderStatus.CANCELLED,
                String.format("Order cannot be cancelled. Current status: %s. " +
                    "Orders can only be cancelled before shipping.",
                    currentStatusEnum != null ? currentStatusEnum.description : "UNKNOWN")
            );
        }
        
        // Validate transition using state machine
        if (!stateMachine.isTransitionAllowed(currentStatusEnum, OrderStatus.CANCELLED)) {
            String errorMessage = stateMachine.getTransitionErrorMessage(currentStatusEnum, OrderStatus.CANCELLED);
            throw new InvalidOrderStatusTransitionException(currentStatusEnum, OrderStatus.CANCELLED, errorMessage);
        }
        
        log.info("Order {} cancelled. Previous status: {}, Reason: {}",
            orderId, currentStatusEnum.value, note);
        
        return createStatusRecord(order, OrderStatus.CANCELLED, note, detail);
    }
    
    /**
     * Overload for backward compatibility
     */
    @Transactional
    public ShopOrderStatus cancelOrder(int orderId, ShopOrderStatus statusObj) {
        return cancelOrder(orderId, statusObj.getNote(), statusObj.getDetail());
    }
    
    /**
     * Confirm order (admin action)
     * Moves order from PENDING_PAYMENT (COD) or PAID -> CONFIRMED
     */
    @Transactional
    public ShopOrderStatus confirmOrder(Integer orderId, String note) {
        return updateOrderStatus(orderId, OrderStatus.CONFIRMED, note, "Order confirmed by admin");
    }
    
    /**
     * Mark order as paid (payment callback)
     */
    @Transactional
    public ShopOrderStatus markAsPaid(Integer orderId, String transactionId) {
        return updateOrderStatus(
            orderId,
            OrderStatus.PAID,
            "Payment received",
            "Transaction ID: " + transactionId
        );
    }
    
    /**
     * Find status by order ID and status enum
     */
    public Optional<ShopOrderStatus> findByOrderIdAndStatus(Integer orderId, OrderStatus status) {
        return statusRepository.findByShopOrderIdAndStatus(orderId, status.id);
    }
    
    /**
     * Get current status of an order
     */
    public Optional<ShopOrderStatus> getCurrentStatus(Integer orderId) {
        return statusRepository.findCurrentStatusByOrderId(orderId);
    }
    
    /**
     * Save status (for internal use)
     */
    public ShopOrderStatus save(ShopOrderStatus status) {
        return statusRepository.save(status);
    }
    
    // ========== Private Helper Methods ==========
    
    /**
     * Create a new status record
     */
    private ShopOrderStatus createStatusRecord(ShopOrder order, OrderStatus status, String note, String detail) {
        ShopOrderStatus statusRecord = new ShopOrderStatus();
        statusRecord.setOrder(order);
        statusRecord.setStatus(status.id);
        statusRecord.setNote(note != null ? note : status.description);
        statusRecord.setDetail(detail);
        
        return statusRepository.save(statusRecord);
    }
    
    /**
     * Get OrderStatus enum by ID
     */
    private OrderStatus getOrderStatusById(Integer statusId) {
        if (statusId == null) {
            return null;
        }
        
        for (OrderStatus status : OrderStatus.values()) {
            if (status.id == statusId) {
                return status;
            }
        }
        
        return null;
    }
}
