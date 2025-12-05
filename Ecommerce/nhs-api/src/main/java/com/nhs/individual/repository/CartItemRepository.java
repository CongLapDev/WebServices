package com.nhs.individual.repository;

import com.nhs.individual.domain.CartItem;
import lombok.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem,Integer> {
    @NonNull
    Page<CartItem> findAllByUser_idOrderByIdDesc(Integer id,Pageable pageable);
    @Modifying
    @Query(value = "update cart_item set qty=?2 where id=?1",nativeQuery = true)
    void updateQty(Integer cartItemId,Integer quantity);

    @Query(value = "select * from cart_item where user_id=?1 and product_item_id=?2",nativeQuery = true)
    Optional<CartItem> findByUser_idAndProduct_item_id(Integer userId,Integer productItemId);
    @Modifying
    @Query(value = "update cart_item set qty=?2 , product_item_id=?3 where id=?1",nativeQuery = true)
    void update(Integer id,Integer qty, Integer productItemId);
}
