package com.nhs.individual.repository.sub_repository;

import com.nhs.individual.views.OverviewStatistic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OverviewStatisticRepository extends JpaRepository<OverviewStatistic,Long> {

}
