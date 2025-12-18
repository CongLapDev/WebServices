package com.nhs.individual.repository;

import com.nhs.individual.domain.OrderLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderLineRepository extends JpaRepository<OrderLine,Integer> {
    @Query("SELECT COUNT(ol) > 0 FROM OrderLine ol WHERE ol.productItem.id = :productItemId")
    boolean existsByProductItemId(@Param("productItemId") Integer productItemId);
    
    @Query("SELECT COUNT(ol) > 0 FROM OrderLine ol WHERE ol.productItem.product.id = :productId")
    boolean existsByProductId(@Param("productId") Integer productId);
}
