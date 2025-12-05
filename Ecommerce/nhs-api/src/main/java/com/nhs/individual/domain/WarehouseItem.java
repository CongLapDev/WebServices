package com.nhs.individual.domain;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.nhs.individual.domain.EmbeddedId.ProductItemInWarehouseId;
import com.nhs.individual.validation.WarehouseValidation;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@Entity
@Table(name = "product_item_in_warehouse")
public class WarehouseItem {
    @EmbeddedId
    @JsonIgnore
    private ProductItemInWarehouseId id;

    @MapsId("productItemId")
    @ManyToOne(fetch = FetchType.EAGER, optional = false,cascade = {CascadeType.PERSIST})
    @JoinColumn(name = "product_item_id", nullable = false)
    @JsonIgnoreProperties("warehouses")
    private ProductItem productItem;

    @MapsId("warehouseId")
    @ManyToOne(fetch = FetchType.EAGER, optional = false,cascade = CascadeType.PERSIST)
    @JoinColumn(name = "warehouse_id", nullable = false)
    @JsonBackReference
    private Warehouse warehouse;


    @Column(name = "SKU")
    private String SKU;
    @Column(name = "quantity")
    @NotNull(groups = WarehouseValidation.class)
    private Integer qty;


}