package com.nhs.individual.repository.sub_repository;

import com.nhs.individual.views.ProductOverView;
import io.micrometer.common.lang.NonNull;
import io.micrometer.common.lang.Nullable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductOverviewRepository extends JpaRepository<ProductOverView,Integer> {
    @NonNull
    Page<ProductOverView> findAll(@Nullable Specification<ProductOverView> specification, @NonNull Pageable pageable);
}
