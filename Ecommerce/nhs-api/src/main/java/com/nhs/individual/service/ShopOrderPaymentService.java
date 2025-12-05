package com.nhs.individual.service;

import com.nhs.individual.domain.ShopOrderPayment;
import com.nhs.individual.repository.ShopOrderPaymentRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@AllArgsConstructor
public class ShopOrderPaymentService {
    private ShopOrderPaymentRepository shopOrderPaymentRepository;
    public ShopOrderPayment save(ShopOrderPayment shopOrderPayment) {
        return shopOrderPaymentRepository.save(shopOrderPayment);
    }
    public Optional<ShopOrderPayment> findByOrderId(Integer orderId) {
        return shopOrderPaymentRepository.findByOrderId(orderId);
    }
}
