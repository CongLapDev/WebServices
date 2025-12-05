package com.nhs.individual.controller;

import com.nhs.individual.domain.PaymentMethod;
import com.nhs.individual.domain.UserPayment;
import com.nhs.individual.service.PaymentService;
import com.nhs.individual.service.UserPaymentService;
import lombok.AllArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;

@RestController
@RequestMapping(value = "/api/v1/payment")
@AllArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;
    private final UserPaymentService userPaymentService;
    @RequestMapping(method = RequestMethod.GET)
    public Collection<PaymentMethod> findAllSupportedPaymentsMethods(){
        return paymentService.findAll();
    }
    @PreAuthorize("#id==authentication.principal.userId or hasRole('ADMIN')")
    @RequestMapping(value = "/user/{id}", method = RequestMethod.GET)
    public Collection<UserPayment> findAllUserPayments(@PathVariable Integer id){
        return userPaymentService.findAllByUserId(id);
    }

}
