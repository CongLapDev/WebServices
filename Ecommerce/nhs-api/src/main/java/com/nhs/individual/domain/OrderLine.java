package com.nhs.individual.domain;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "order_line")
public class OrderLine {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER,cascade = CascadeType.MERGE)
    @JoinColumn(name = "product_item_id")
    @NotNull(message = "Product item information is required")
    private ProductItem productItem;



    @Column(name = "qty")
    private Integer qty;
    @Column(name = "total", precision = 18,scale = 9)
    @Min(value = 1,message = "Total value is in valid! Total value can't be negative")
    private BigDecimal total;

    @ManyToOne(fetch = FetchType.LAZY,cascade = CascadeType.ALL)
    @JoinColumn(name = "order_id")
    @JsonBackReference
    private ShopOrder order;
}