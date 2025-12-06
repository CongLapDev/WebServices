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
        var list = repository.findAll();
        if (list == null || list.isEmpty()) {
            // No statistics available yet for this account/user; return null to avoid IndexOutOfBounds
            return null;
        }
        return list.get(0);
    }
}
