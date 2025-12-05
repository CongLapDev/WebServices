package com.nhs.individual.repository.sub_repository;

import com.nhs.individual.views.Accountstatisticsview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountStatisticRepository extends JpaRepository<Accountstatisticsview, Integer> {

}
