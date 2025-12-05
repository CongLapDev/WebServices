package com.nhs.individual.service.sub_service;

import com.nhs.individual.repository.sub_repository.OrderPerDayRepository;
import com.nhs.individual.views.OrderPerDay;
import lombok.AllArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class OrderPerdayService {
    OrderPerDayRepository repository;
    public List<OrderPerDay> findAll(Specification<OrderPerDay> spec){
        return repository.findAll(spec);
    }
    public List<OrderPerDay> findAll(){
        return repository.findAll();
    };
}
