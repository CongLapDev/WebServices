package com.nhs.individual.repository;

import com.nhs.individual.domain.Product;
import io.micrometer.common.lang.NonNull;
import io.micrometer.common.lang.Nullable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection;

@Repository
public interface ProductRepository extends JpaRepository<Product,Integer>, JpaSpecificationExecutor<Product> {
    Collection<Product> findAllByCategory_id(Integer categoryId);
    @Query(value = "select * from product\n" +
            "    join product_item on product.id = product_item.product_id\n" +
            "    join product_item_in_warehouse on product_item_in_warehouse.product_item_id=product_item.id\n" +
            "    where product_item_in_warehouse.warehouse_id=?1",nativeQuery = true)
    Collection<Product> findAllByWarehouseId(Integer warehouseId);
    @NonNull
    Page<Product> findAll(@Nullable Specification<Product> specification, @NonNull Pageable pageable);
}
