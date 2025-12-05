package com.nhs.individual.views;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.nhs.individual.domain.Product;
import com.nhs.individual.dto.ProductDto;
import com.nhs.individual.views.EmbeddedId.ProductDateId;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Subselect;

@Getter
@Setter
@Immutable
@Entity
@Subselect("select sum(qty) as qty,\n" +
        "       product_item.product_id,\n" +
        "       date_format(shop_order.order_date,\"%Y-%m-%d\")\n" +
        "    as date\n" +
        "from shop_order\n" +
        "join order_line\n" +
        "     on shop_order.id=order_line.order_id\n" +
        "join product_item\n" +
        "on order_line.product_item_id=product_item.id\n" +
        "group by product_item.product_id,date")
public class MostProductOrder {
    @Id
    ProductDateId id;
    private Integer qty;

    @MapsId("productId")
    @OneToOne
    @JoinColumn(name = "product_id", insertable = false,updatable = false)
    Product product;

    @MapsId("date")
    @ManyToOne
    @JoinColumn(name = "date", insertable = false,updatable = false)
    @JsonIgnore
    private OrderPerDay orderPerDay;

    public ProductDto getProduct() {
        return new ProductDto(product);
    }
}
