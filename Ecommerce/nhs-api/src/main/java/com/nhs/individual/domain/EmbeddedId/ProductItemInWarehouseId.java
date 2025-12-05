package com.nhs.individual.domain.EmbeddedId;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@Embeddable
@AllArgsConstructor
@NoArgsConstructor
public class ProductItemInWarehouseId implements Serializable {
    @Serial
    private static final long serialVersionUID = -7683595233898852023L;
    @Column(name = "product_item_id", nullable = false)
    private Integer productItemId;

    @Column(name = "warehouse_id", nullable = false)
    private Integer warehouseId;


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        ProductItemInWarehouseId entity = (ProductItemInWarehouseId) o;
        return Objects.equals(this.warehouseId, entity.warehouseId) &&
                Objects.equals(this.productItemId, entity.productItemId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(warehouseId, productItemId);
    }

}