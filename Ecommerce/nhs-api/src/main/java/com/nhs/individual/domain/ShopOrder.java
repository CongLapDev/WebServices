package com.nhs.individual.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.swagger.v3.oas.annotations.Hidden;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "shop_order")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ShopOrder implements Serializable {
    @Id
    @Column(name = "id", nullable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY,cascade = CascadeType.MERGE)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"account","userAddresses","hibernateLazyInitializer","handler"})
    private User user;

    @Column(name = "user_id",insertable = false,updatable = false)
    @Hidden
    private Integer userId;
    @ManyToOne(fetch = FetchType.EAGER,cascade = CascadeType.MERGE)
    @JoinColumn(name = "address_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
    private Address address;


    @Column(name = "order_date",insertable = false,columnDefinition = "DATETIME default now()")
    private Date orderDate;

    @Column(name = "total",scale = 2, precision = 18)
    @Min(value = 1,message = "Total value can not be negative or equal to 0")
    private BigDecimal total;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipping_method")
    @JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
    private ShippingMethod shippingMethod;

    @Lob
    @Column(name = "note")
    private String note;

    @OneToMany(mappedBy = "order",fetch = FetchType.EAGER,cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"order","hibernateLazyInitializer","handler"})
    private List<ShopOrderStatus> status;

    @OneToMany(mappedBy = "order",fetch = FetchType.EAGER,cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"order","hibernateLazyInitializer", "handler"})
    private List<OrderLine> orderLines;

    @OneToOne(fetch = FetchType.EAGER,cascade =CascadeType.ALL)
    @JoinColumn(name = "payment_id", nullable = false)
    private ShopOrderPayment payment;
}