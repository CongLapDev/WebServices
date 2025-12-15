package com.nhs.individual.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.nhs.individual.constant.OrderStatus;
import com.nhs.individual.constant.PaymentStatus;
import com.nhs.individual.domain.ShopOrder;
import com.nhs.individual.domain.ShopOrderStatus;
import com.nhs.individual.repository.ShopOrderRepository;
import com.nhs.individual.zalopay.config.ZaloConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

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
    public ShopOrder createOrder(ShopOrder order) {
        ShopOrderStatus shopOrderStatus=new ShopOrderStatus();
        shopOrderStatus.setStatus(OrderStatus.PENDING_PAYMENT.id);
        shopOrderStatus.setOrder(order);
        shopOrderStatus.setNote("Order created - awaiting payment");
        order.setStatus(List.of(shopOrderStatus));
        order.getOrderLines().forEach(line->line.setOrder(order));
        order.getPayment().setOrder(order);
        order.getPayment().setStatus(PaymentStatus.PENDING.value);
        return orderRepository.save(order);
    }

    public Collection<ShopOrder> findAllByUserId(int userId, Pageable pageable) {
        return orderRepository.findAllByUser_Id(userId,pageable);
    }

}
