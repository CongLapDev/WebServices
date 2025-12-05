package com.nhs.individual.service.sub_service;

import com.nhs.individual.repository.sub_repository.OverviewStatisticRepository;
import com.nhs.individual.views.OverviewStatistic;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class OverviewStatisticService {
    private OverviewStatisticRepository repository;
    public List<OverviewStatistic> findAll() {
        return repository.findAll();
    }
}
