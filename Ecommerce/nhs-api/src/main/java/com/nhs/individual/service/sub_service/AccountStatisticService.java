package com.nhs.individual.service.sub_service;

import com.nhs.individual.repository.sub_repository.AccountStatisticRepository;
import com.nhs.individual.views.Accountstatisticsview;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AccountStatisticService {
    AccountStatisticRepository repository;
    public Accountstatisticsview findAll(){
        return repository.findAll().get(0);
    }
}
