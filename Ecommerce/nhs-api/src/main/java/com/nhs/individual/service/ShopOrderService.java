package com.nhs.individual.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.nhs.individual.constant.OrderStatus;
import com.nhs.individual.constant.PaymentStatus;
import com.nhs.individual.domain.ShopOrder;
import com.nhs.individual.domain.ShopOrderStatus;
import com.nhs.individual.repository.ShopOrderRepository;
import com.nhs.individual.zalopay.config.ZaloConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class ShopOrderService {
    @Autowired
    ZaloConfig zalopayconfig;
    private final ObjectWriter ow = new ObjectMapper().writer().withDefaultPrettyPrinter();
    @Autowired
    ShopOrderRepository orderRepository;
    @Autowired
    AuthService authService;
    public Optional<ShopOrder> findById(Integer id){
        return orderRepository.findById(id);
    }
//    public List<ShopOrder> findAll(Integer userId, String dateFrom, String dateTo, Integer page, Integer size, OrderStatus orderStatus, String orderBy, Sort.Direction direction){
//        return shopOrderSpecificationImp.findAll(userId,dateFrom,dateTo,page,size,orderStatus,orderBy,direction);
//    }
    public Page<ShopOrder> findAll(List<Specification<ShopOrder>> specifications, Pageable pageable){
        if(specifications.isEmpty()) return orderRepository.findAll(pageable);
        Specification<ShopOrder> specification=specifications.get(0);
        for(int i=1;i<specifications.size();i++){
            specification=specification.and(specifications.get(i));
        }

        return orderRepository.findAll(specification,pageable);
    }
    /**
     * Create new order and calculate total from orderLines + shipping
     * 
     * @param order Order to create (total will be recalculated on server)
     * @return Created order with correct total
     */
    public ShopOrder createOrder(ShopOrder order) {
        log.info("========== Creating Order ==========");
        log.info("User ID: {}", order.getUser() != null ? order.getUser().getId() : "NULL");
        log.info("Order Lines count: {}", order.getOrderLines() != null ? order.getOrderLines().size() : 0);
        log.info("Shipping Method: {}", order.getShippingMethod() != null ? order.getShippingMethod().getName() : "NULL");
        log.info("Frontend total (IGNORED): {}", order.getTotal());
        
        // CRITICAL: Calculate total on server-side, don't trust frontend
        BigDecimal calculatedTotal = BigDecimal.ZERO;
        
        // Sum all orderLine totals
        if (order.getOrderLines() != null && !order.getOrderLines().isEmpty()) {
            for (var line : order.getOrderLines()) {
                if (line.getTotal() != null) {
                    calculatedTotal = calculatedTotal.add(line.getTotal());
                    log.debug("  OrderLine: qty={}, lineTotal={}", line.getQty(), line.getTotal());
                } else {
                    log.warn("  OrderLine has NULL total, skipping");
                }
            }
            log.info("✓ OrderLines total: {}", calculatedTotal);
        } else {
            log.warn("⚠️ No order lines provided!");
        }
        
        // Add shipping price
        if (order.getShippingMethod() != null && order.getShippingMethod().getPrice() != null) {
            BigDecimal shippingPrice = order.getShippingMethod().getPrice();
            calculatedTotal = calculatedTotal.add(shippingPrice);
            log.info("✓ Shipping price: {}", shippingPrice);
        } else {
            log.warn("⚠️ No shipping method or shipping price is NULL");
        }
        
        // Set the calculated total (override frontend value)
        order.setTotal(calculatedTotal);
        log.info("========================================");
        log.info("✓✓✓ FINAL ORDER TOTAL: {} ✓✓✓", calculatedTotal);
        log.info("========================================");
        
        // Validate total > 0
        if (calculatedTotal.compareTo(BigDecimal.ZERO) <= 0) {
            log.error("❌ Order total is 0 or negative: {}", calculatedTotal);
            throw new IllegalArgumentException("Order total must be greater than 0. Calculated total: " + calculatedTotal);
        }
        
        // Create order status
        ShopOrderStatus shopOrderStatus = new ShopOrderStatus();
        shopOrderStatus.setStatus(OrderStatus.PENDING_PAYMENT.id);
        shopOrderStatus.setOrder(order);
        shopOrderStatus.setNote("Order created - awaiting payment");
        order.setStatus(List.of(shopOrderStatus));
        
        // Set relationships
        order.getOrderLines().forEach(line -> line.setOrder(order));
        order.getPayment().setOrder(order);
        order.getPayment().setStatus(PaymentStatus.PENDING.value);
        
        ShopOrder savedOrder = orderRepository.save(order);
        log.info("✓ Order #{} created successfully with total: {}", savedOrder.getId(), savedOrder.getTotal());
        
        return savedOrder;
    }

    public Collection<ShopOrder> findAllByUserId(int userId, Pageable pageable) {
        return orderRepository.findAllByUser_Id(userId,pageable);
    }

}
