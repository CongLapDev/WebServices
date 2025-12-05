package com.nhs.individual.repository;

import com.nhs.individual.domain.ShopOrder;
import io.micrometer.common.lang.NonNull;
import io.micrometer.common.lang.Nullable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShopOrderRepository extends JpaRepository<ShopOrder, Integer> {
    List<ShopOrder> findAllByUser_Id(Integer userId, Pageable pageable);
    @NonNull
    Page<ShopOrder> findAll(@Nullable Specification<ShopOrder> specification, @NonNull Pageable pageable);

}
