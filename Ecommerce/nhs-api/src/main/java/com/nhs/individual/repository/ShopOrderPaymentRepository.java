package com.nhs.individual.repository;

import com.nhs.individual.domain.ShopOrderPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShopOrderPaymentRepository extends JpaRepository<ShopOrderPayment, Integer> {
    @Query(value = "select * from shop_order_payment where id=(Select shop_order.payment_id from shop_order where id=?1)",nativeQuery = true)
    Optional<ShopOrderPayment> findByOrderId(Integer order_id);
}
