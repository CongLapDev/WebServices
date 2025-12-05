package com.nhs.individual.repository;

import com.nhs.individual.domain.Variation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VariationRepository extends JpaRepository<Variation,Integer> {
}
