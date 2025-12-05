package com.nhs.individual.specification.SpecificationImp;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

@Repository
@Deprecated
public class GeneralSpecificationImp {
    @PersistenceContext
    EntityManager entityManager;
}
