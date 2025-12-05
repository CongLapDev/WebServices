package com.nhs.individual.domain;

import io.swagger.v3.oas.annotations.Hidden;
import jakarta.persistence.*;
import lombok.Data;

import java.sql.Date;

@Entity
@Table(name = "shop_order_status")
@Data
public class ShopOrderStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;
    @ManyToOne
    @JoinColumn(name = "shop_order_id")
    private ShopOrder order;

    @Column(name = "shop_order_id",updatable = false,insertable = false)
    @Hidden
    private Integer shopOrderId;

    @Column(name = "update_at",columnDefinition = "Datetime default now()",insertable = false)
    private Date updateAt;
    @Column(name="detail")
    private String detail;
    @Column(name = "note")
    private String note;
    @Column(name = "status")
    private Integer status;

}
