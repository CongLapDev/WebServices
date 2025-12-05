package com.nhs.individual.repository.sub_repository;

import com.nhs.individual.views.OrderPerDay;
import lombok.NonNull;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.util.List;

@Repository
public interface OrderPerDayRepository extends JpaRepository<OrderPerDay, Date> {
    @NonNull
    List<OrderPerDay> findAll(Specification<OrderPerDay> specification);
}
