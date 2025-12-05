package com.nhs.individual.service;

import com.nhs.individual.domain.ShippingMethod;
import com.nhs.individual.repository.ShippingMethodRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collection;

@Service
public class ShippingMethodService {
    @Autowired
    private ShippingMethodRepository shippingMethodRepository;
    public Collection<ShippingMethod> findAll(){
        return shippingMethodRepository.findAll();
    }
}
