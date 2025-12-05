package com.nhs.individual.service;

import com.nhs.individual.constant.OrderStatus;
import com.nhs.individual.domain.ShopOrder;
import com.nhs.individual.domain.ShopOrderStatus;
import com.nhs.individual.exception.DataException;
import com.nhs.individual.repository.ShopOrderStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ShopOrderStatusService {
    @Autowired
    ShopOrderStatusRepository repository;
    public ShopOrderStatus updateOrderStatus(Integer orderId,ShopOrderStatus status){
        ShopOrder shopOrder=new ShopOrder();
        shopOrder.setId(orderId);
        status.setOrder(shopOrder);
        return repository.findCurrentStatusByOrderId(orderId).map(shopOrderStatus -> {
            if(status.getStatus()>shopOrderStatus.getStatus()||status.getStatus()==OrderStatus.PAID.id){
                return repository.save(status);
            }else throw new DataException("Illegal status value");
        }).orElse(repository.save(status));
    }
    public ShopOrderStatus cancelOrder(int orderId,ShopOrderStatus status){
        ShopOrder shopOrder=new ShopOrder();
        shopOrder.setId(orderId);
        status.setStatus(OrderStatus.CANCEL.id);
        status.setOrder(shopOrder);
        return repository.findCurrentStatusByOrderId(orderId).map(shopOrderStatus -> {
            System.out.println(shopOrderStatus);
            if(shopOrderStatus.getStatus()>2) throw new DataException("Illegal status value");
            else return repository.save(status);
        }).orElse(repository.save(status));
    }

    public Optional<ShopOrderStatus> findByOrderIdAndStatus(Integer orderId, OrderStatus status){
        return repository.findByShopOrderIdAndStatus(orderId,status.id);
    }
    public ShopOrderStatus save(ShopOrderStatus status){
        return repository.save(status);
    }
}
