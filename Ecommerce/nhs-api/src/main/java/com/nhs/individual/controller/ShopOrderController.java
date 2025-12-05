package com.nhs.individual.controller;

import com.nhs.individual.constant.OrderStatus;
import com.nhs.individual.domain.ShopOrder;
import com.nhs.individual.domain.ShopOrderStatus;
import com.nhs.individual.exception.ResourceNotFoundException;
import com.nhs.individual.service.ShopOrderService;
import com.nhs.individual.service.ShopOrderStatusService;
import com.nhs.individual.specification.ISpecification.IShopOrderSpecification;
import com.nhs.individual.workbook.ShopOrdersXLSX;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
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

@RestController
@RequestMapping(value = "/api/v1/order")
public class ShopOrderController {
    @Autowired
    ShopOrderService shopOrderService;
    @Autowired
    ShopOrderStatusService shopOrderStatusService;

    @RequestMapping(method = RequestMethod.POST)
    @PreAuthorize("#order.user.id==authentication.principal.userId")
    public ShopOrder createOrder(@RequestBody ShopOrder order) {
        return shopOrderService.createOrder(order);
    }
    @RequestMapping(value = "/xlsx", method = RequestMethod.GET)
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


//    @PreAuthorize("hasAuthority('ADMIN') or #params.get('userId')==authentication.principal.userId.toString()")
    @RequestMapping(method = RequestMethod.GET)
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
        if(from!=null&&to!=null) shopOrderSpecifications.add(IShopOrderSpecification.fromToDate(Timestamp.from(from.toInstant()),Timestamp.from(to.toInstant())));
        String[] arr=new String[sortBy.size()];
        Sort sorts=Sort.by(sort,sortBy.toArray(sortBy.toArray(arr)));
        Pageable pageable=PageRequest.of(page,size,sorts);
        return shopOrderService.findAll(shopOrderSpecifications,pageable);
    }

    @RequestMapping(value = "/{id}",method = RequestMethod.GET)
    public ShopOrder getOrderById(@PathVariable(name = "id") Integer id) {
        return shopOrderService.findById(id).orElseThrow(()-> new ResourceNotFoundException("Could not find order with id " + id));
    }

//    ShopOrderStatus control
    @RequestMapping(value = "/{orderId}/status",method = RequestMethod.POST)
    public ShopOrderStatus updateStatus(@PathVariable(name = "orderId") Integer orderId,
            @RequestBody ShopOrderStatus shopOrderStatus){
        return shopOrderStatusService.updateOrderStatus(orderId,shopOrderStatus);
    }
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @RequestMapping(value = "/{orderId}/status/APPROVE",method = RequestMethod.POST)
    public ShopOrderStatus approveOrder(@PathVariable(name = "orderId") Integer orderId,
                                        @RequestBody ShopOrderStatus shopOrderStatus){
        shopOrderStatus.setStatus(OrderStatus.PREPARING.id);
        return shopOrderStatusService.updateOrderStatus(orderId,shopOrderStatus);
    }

    @RequestMapping(value = "/{orderId}/status/CANCEL",method = RequestMethod.POST)
    public ShopOrderStatus cancelOrder(@PathVariable(name = "orderId") Integer orderId,
                                      @RequestBody ShopOrderStatus shopOrderStatus){
        return shopOrderStatusService.cancelOrder(orderId,shopOrderStatus);
    }

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
            specifications.add(IShopOrderSpecification.byStatus(OrderStatus.valueOf(params.get("status").toUpperCase())));
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
