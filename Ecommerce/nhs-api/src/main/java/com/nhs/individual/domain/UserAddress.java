package com.nhs.individual.domain;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;


@Entity
@Table(name = "user_address")
@Getter
@Setter
public class UserAddress {
    @EmbeddedId
    private UserAddressId id;

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.LAZY,cascade = CascadeType.MERGE, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private User user;

    @MapsId("addressId")
    @ManyToOne(fetch = FetchType.EAGER,cascade = CascadeType.ALL)
    @JoinColumn(name = "address_id", nullable = false)
    private Address address;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "is_default")
    private Boolean isDefault;

    @Column(name = "is_business")
    private Boolean isBusiness;


}