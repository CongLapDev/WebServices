package com.nhs.individual.repository;

import com.nhs.individual.domain.ShopOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShopOrderStatusRepository extends JpaRepository<ShopOrderStatus, Integer> {
    @Query(value = "SELECT * from shop_order_status sho where sho.shop_order_id=?1 order by id desc limit 1",nativeQuery = true)
    Optional<ShopOrderStatus> findCurrentStatusByOrderId(Integer shopOrderId);
    Optional<ShopOrderStatus> findByShopOrderIdAndStatus(Integer shopOrderId, Integer status);
}
