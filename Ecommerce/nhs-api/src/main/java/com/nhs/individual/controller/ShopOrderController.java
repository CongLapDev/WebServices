package com.nhs.individual.controller;

import com.nhs.individual.constant.OrderStatus;
import com.nhs.individual.domain.ShopOrder;
import com.nhs.individual.domain.ShopOrderStatus;
import com.nhs.individual.exception.OrderNotFoundException;
import com.nhs.individual.service.ShopOrderService;
import com.nhs.individual.service.ShopOrderStatusService;
import com.nhs.individual.specification.ISpecification.IShopOrderSpecification;
import com.nhs.individual.workbook.ShopOrdersXLSX;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.sql.Timestamp;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * Controller for Order Management
 * 
 * Endpoints:
 * - POST /api/v1/order - Create new order
 * - GET /api/v1/order - List orders (with filters)
 * - GET /api/v1/order/{id} - Get order details
 * - POST /api/v1/order/{id}/status/confirm - Admin confirms order (COD)
 * - POST /api/v1/order/{id}/status/prepare - Start preparing order
 * - POST /api/v1/order/{id}/status/ship - Mark as shipping
 * - POST /api/v1/order/{id}/status/deliver - Mark as delivered
 * - POST /api/v1/order/{id}/status/complete - Mark as completed
 * - POST /api/v1/order/{id}/cancel - Cancel order (user/admin)
 */
@Slf4j
@RestController
@RequestMapping(value = "/api/v1/order")
public class ShopOrderController {
    
    @Autowired
    ShopOrderService shopOrderService;
    
    @Autowired
    ShopOrderStatusService shopOrderStatusService;

    /**
     * Create new order
     * User can only create order for themselves
     */
    @PostMapping
    @PreAuthorize("#order.user.id == authentication.principal.userId")
    public ShopOrder createOrder(@RequestBody ShopOrder order) {
        log.info("Creating order for user {}", order.getUser().getId());
        return shopOrderService.createOrder(order);
    }
    
    /**
     * Export orders to Excel
     * Admin only
     */
    @GetMapping("/xlsx")
    @Secured("ADMIN")
    public void exportExcel(@RequestParam Map<String,String> params,
                            HttpServletResponse response) throws IOException {
        List<ShopOrder> orders = findAllWithParams(params);
        response.setContentType("application/octet-stream");
        DateFormat dateFormatter = new SimpleDateFormat("yyyy-MM-dd_HH:mm:ss");
        String currentDateTime = dateFormatter.format(new Date());
        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=orders" + currentDateTime + ".xlsx";
        response.setHeader(headerKey, headerValue);
        try(Workbook workbook=ShopOrdersXLSX.from(orders)){
            workbook.write(response.getOutputStream());
        }
    }

    /**
     * List all orders with filters
     * Users see only their orders, Admin sees all
     */
    @GetMapping
    public Page<ShopOrder> findAll(
            @RequestParam(name = "page",defaultValue = "0") Integer page,
            @RequestParam(name = "size",defaultValue = "10") Integer size,
            @RequestParam(name = "userId",required = false) Integer userId,
            @RequestParam(name = "status",required = false) OrderStatus status,
            @RequestParam(name = "address",required = false) String address,
            @RequestParam(name = "from",required = false) Date from,
            @RequestParam(name = "to",required = false) Date to,
            @RequestParam(name = "newest",required = false) String newest,
            @RequestParam(name = "sortBy",required = false,defaultValue = "id") List<String> sortBy,
            @RequestParam(name = "sort",required = false,defaultValue = "DESC") Sort.Direction sort,
            @RequestParam Map<String,String> params) {
        
        List<Specification<ShopOrder>> shopOrderSpecifications = new ArrayList<>();
        if(userId!=null) shopOrderSpecifications.add(IShopOrderSpecification.byUser(userId));
        if(status!=null) shopOrderSpecifications.add(IShopOrderSpecification.byStatus(status));
        if(address!=null) shopOrderSpecifications.add(IShopOrderSpecification.byAddress(address));
        if(from!=null&&to!=null) shopOrderSpecifications.add(IShopOrderSpecification.fromToDate(
            Timestamp.from(from.toInstant()),Timestamp.from(to.toInstant())));
        
        String[] arr=new String[sortBy.size()];
        Sort sorts=Sort.by(sort,sortBy.toArray(sortBy.toArray(arr)));
        Pageable pageable=PageRequest.of(page,size,sorts);
        return shopOrderService.findAll(shopOrderSpecifications,pageable);
    }

    /**
     * Get order by ID
     * User can view their own orders, Admin can view all
     */
    @GetMapping("/{id}")
    @PreAuthorize("@orderSecurityService.canView(#id, authentication)")
    public ShopOrder getOrderById(@PathVariable(name = "id") Integer id) {
        return shopOrderService.findById(id)
            .orElseThrow(()-> new OrderNotFoundException(id));
    }

    // ========== Admin Order Status Transitions ==========
    
    /**
     * Confirm order (COD flow or after payment)
     * Admin only
     */
    @PostMapping("/{orderId}/status/confirm")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ADMIN')")
    public ResponseEntity<ShopOrderStatus> confirmOrder(
            @PathVariable Integer orderId,
            @RequestBody(required = false) Map<String, String> body) {
        
        String note = body != null ? body.get("note") : "Order confirmed by admin";
        log.info("Admin confirming order {}", orderId);
        
        ShopOrderStatus status = shopOrderStatusService.confirmOrder(orderId, note);
        return ResponseEntity.ok(status);
    }
    
    /**
     * Start preparing order
     * Admin only
     */
    @PostMapping("/{orderId}/status/prepare")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ADMIN')")
    public ResponseEntity<ShopOrderStatus> prepareOrder(
            @PathVariable Integer orderId,
            @RequestBody(required = false) Map<String, String> body) {
        
        String note = body != null ? body.get("note") : "Order preparation started";
        log.info("Admin preparing order {}", orderId);
        
        ShopOrderStatus status = shopOrderStatusService.updateOrderStatus(
            orderId, OrderStatus.PREPARING, note, null);
        return ResponseEntity.ok(status);
    }
    
    /**
     * Mark order as shipping
     * Admin only
     */
    @PostMapping("/{orderId}/status/ship")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ADMIN')")
    public ResponseEntity<ShopOrderStatus> shipOrder(
            @PathVariable Integer orderId,
            @RequestBody(required = false) Map<String, String> body) {
        
        String note = body != null ? body.get("note") : "Order shipped";
        String trackingNumber = body != null ? body.get("trackingNumber") : null;
        log.info("Admin shipping order {}", orderId);
        
        ShopOrderStatus status = shopOrderStatusService.updateOrderStatus(
            orderId, OrderStatus.SHIPPING, note, trackingNumber);
        return ResponseEntity.ok(status);
    }
    
    /**
     * Mark order as delivered
     * Admin only
     */
    @PostMapping("/{orderId}/status/deliver")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ADMIN')")
    public ResponseEntity<ShopOrderStatus> deliverOrder(
            @PathVariable Integer orderId,
            @RequestBody(required = false) Map<String, String> body) {
        
        String note = body != null ? body.get("note") : "Order delivered";
        log.info("Admin marking order {} as delivered", orderId);
        
        ShopOrderStatus status = shopOrderStatusService.updateOrderStatus(
            orderId, OrderStatus.DELIVERED, note, null);
        return ResponseEntity.ok(status);
    }
    
    /**
     * Mark order as completed
     * Admin or User (owner) can complete
     */
    @PostMapping("/{orderId}/status/complete")
    @PreAuthorize("@orderSecurityService.canView(#orderId, authentication)")
    public ResponseEntity<ShopOrderStatus> completeOrder(
            @PathVariable Integer orderId,
            @RequestBody(required = false) Map<String, String> body) {
        
        String note = body != null ? body.get("note") : "Order completed";
        log.info("Completing order {}", orderId);
        
        ShopOrderStatus status = shopOrderStatusService.updateOrderStatus(
            orderId, OrderStatus.COMPLETED, note, null);
        return ResponseEntity.ok(status);
    }

    // ========== Cancel Order ==========
    
    /**
     * Cancel order
     * User can cancel their own order, Admin can cancel any order
     */
    @PostMapping("/{orderId}/cancel")
    @PreAuthorize("@orderSecurityService.canCancel(#orderId, authentication)")
    public ResponseEntity<ShopOrderStatus> cancelOrder(
            @PathVariable Integer orderId,
            @RequestBody(required = false) Map<String, String> body) {
        
        String note = body != null ? body.get("note") : "Order cancelled";
        String detail = body != null ? body.get("detail") : null;
        log.info("Cancelling order {}: {}", orderId, note);
        
        ShopOrderStatus status = shopOrderStatusService.cancelOrder(orderId, note, detail);
        return ResponseEntity.ok(status);
    }
    
    // ========== Legacy Endpoints (for backward compatibility) ==========
    
    /**
     * @deprecated Use specific endpoints like /confirm, /prepare, etc.
     */
    @Deprecated
    @PostMapping("/{orderId}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ADMIN')")
    public ShopOrderStatus updateStatus(
            @PathVariable Integer orderId,
            @RequestBody ShopOrderStatus shopOrderStatus) {
        log.warn("Using deprecated endpoint POST /{}/status", orderId);
        return shopOrderStatusService.updateOrderStatus(orderId, shopOrderStatus);
    }
    
    /**
     * @deprecated Use POST /{orderId}/status/confirm
     */
    @Deprecated
    @PostMapping("/{orderId}/status/APPROVE")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ADMIN')")
    public ShopOrderStatus approveOrder(
            @PathVariable Integer orderId,
            @RequestBody ShopOrderStatus shopOrderStatus) {
        log.warn("Using deprecated endpoint POST /{}/status/APPROVE", orderId);
        return shopOrderStatusService.confirmOrder(orderId, shopOrderStatus.getNote());
    }
    
    /**
     * @deprecated Use POST /{orderId}/cancel
     */
    @Deprecated
    @PostMapping("/{orderId}/status/CANCEL")
    @PreAuthorize("@orderSecurityService.canCancel(#orderId, authentication)")
    public ShopOrderStatus cancelOrderLegacy(
            @PathVariable Integer orderId,
            @RequestBody ShopOrderStatus shopOrderStatus) {
        log.warn("Using deprecated endpoint POST /{}/status/CANCEL", orderId);
        return shopOrderStatusService.cancelOrder(orderId, shopOrderStatus);
    }

    // ========== Helper Methods ==========
    
    private List<ShopOrder> findAllWithParams(Map<String,String> params){
        int page= 0;
        int size=10;
        if(params.get("page")!=null){
            try{
                page= Integer.parseInt(params.get("page"));
                size= Integer.parseInt(params.get("size"));
            }catch (NumberFormatException e){
                throw new IllegalArgumentException("Page or size must be number");
            }
        }
        List<Specification<ShopOrder>> specifications=new ArrayList<Specification<ShopOrder>>();
        if(params.get("userId")!=null){
            try {
                specifications.add(IShopOrderSpecification.byUser(Integer.valueOf(params.get("userId"))));
            }catch (NumberFormatException e) {
                throw new IllegalArgumentException("Invalid user id");
            }
            params.remove("userId");
        }
        if(params.get("status")!=null){
            OrderStatus status=OrderStatus.valueOf(params.get("status").toUpperCase());
            specifications.add(IShopOrderSpecification.byStatus(status));
        }
        if(params.get("address")!=null){
            specifications.add(IShopOrderSpecification.byAddress(params.get("address")));
        }
        Timestamp to=Timestamp.from(Instant.now());
        SimpleDateFormat dateFormat=new SimpleDateFormat("yyyy-MM-dd HH-mm-ss");
        try{
            if(params.get("from")!=null){
                Timestamp from=Timestamp.from(dateFormat.parse(params.get("from")).toInstant());
                if(params.get("to")!=null){
                    to=Timestamp.from(dateFormat.parse(params.get("to")).toInstant());
                }
                specifications.add(IShopOrderSpecification.fromToDate(from,to));
            }
        } catch (ParseException e) {
            throw new IllegalArgumentException("Illegal date format");
        }

        Sort sort=Sort.by("id").descending();
        if(params.get("newest")!=null&&params.get("newest").equalsIgnoreCase("ASC")){
            sort.ascending();
        }
        Pageable pageable=PageRequest.of(page,size,sort);
        return shopOrderService.findAll(specifications, pageable).getContent();
    }
}
