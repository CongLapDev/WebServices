package com.nhs.individual.service;

import com.nhs.individual.domain.UserPayment;
import com.nhs.individual.repository.UserPaymentRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class UserPaymentService {
    private final UserPaymentRepository userPaymentRepository;
    public List<UserPayment> findAllByUserId(Integer userId){
        return userPaymentRepository.findAllByUser_Id(userId);
    }
}
