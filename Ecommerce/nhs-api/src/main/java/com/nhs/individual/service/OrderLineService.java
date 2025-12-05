package com.nhs.individual.service;

import com.nhs.individual.repository.OrderLineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OrderLineService {
    @Autowired
    private OrderLineRepository orderLineRepository;
}
