package com.nhs.individual.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "shop_order_payment")
public class ShopOrderPayment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false,cascade = CascadeType.MERGE)
    @JoinColumn(name = "payment_id", nullable = true)
    private Payment type;


    @OneToOne(mappedBy = "payment", optional = false,cascade = CascadeType.MERGE)
    @JsonIgnore
    private ShopOrder order;

    @Size(max = 45)
    @Column(name = "order_number", length = 45)
    private String orderNumber;

    @ColumnDefault("now()")
    @Column(name = "update_at",columnDefinition = "datetime")
    @LastModifiedDate
    private Instant updateAt;

    @CreatedDate
    private Instant createdAt;

    @Column(name = "status")
    private Integer status;

}