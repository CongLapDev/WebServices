package com.nhs.individual.domain;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.nhs.individual.validation.AddressValidation;
import com.nhs.individual.validation.UserAddressValidation;
import com.nhs.individual.validation.WarehouseValidation;
import jakarta.persistence.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.validator.constraints.Length;

import java.util.Collection;

@Getter
@Setter
@Entity
@Table(name = "warehouse")
public class Warehouse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @NotNull(groups = WarehouseValidation.onCreate.class)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY,cascade = CascadeType.ALL)
    @JoinColumn(name = "address_id")
    @NotNull(message = "Address information is required",groups = {UserAddressValidation.class, AddressValidation.onCreate.class})
    @Valid
    private Address address;
    @Column(name = "name")
    @Length(min = 1,max = 45,message = "Warehouse identifier (Warehouse name) is required")
    private String name;
    @Column(name = "detail")
    private String detail;
    @OneToMany(mappedBy = "warehouse")
    @JsonManagedReference
    public Collection<WarehouseItem> warehouseItems;

}