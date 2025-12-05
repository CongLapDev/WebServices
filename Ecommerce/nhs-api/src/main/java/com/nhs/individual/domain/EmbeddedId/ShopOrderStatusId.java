package com.nhs.individual.domain.EmbeddedId;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@Embeddable
@AllArgsConstructor
@NoArgsConstructor
public class ShopOrderStatusId implements Serializable {
    @Column(name = "order_status_id",nullable = false)
    private Integer orderStatusId;
    @Column(name = "shop_order_id",nullable = false)
    private Integer shopOrderId;
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        ShopOrderStatusId entity = (ShopOrderStatusId) o;
        return Objects.equals(this.orderStatusId, entity.orderStatusId) &&
                Objects.equals(this.shopOrderId, entity.shopOrderId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(orderStatusId, shopOrderId);
    }
}
