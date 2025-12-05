package com.nhs.individual.controller;

import com.nhs.individual.domain.ShippingMethod;
import com.nhs.individual.service.ShippingMethodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;

@RestController
@RequestMapping(value = "/api/v1/shipmethod")
public class ShippingMethodController {
    @Autowired
    ShippingMethodService shippingMethodService;
    @RequestMapping(method = RequestMethod.GET)
    public Collection<ShippingMethod> getShippingMethods(){
        return shippingMethodService.findAll();
    }


}
