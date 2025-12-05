package com.nhs.individual.service;

import com.nhs.individual.domain.PaymentMethod;
import com.nhs.individual.repository.PaymentRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    public List<PaymentMethod> findAll(){
        return paymentRepository.findAll();
    }

}
