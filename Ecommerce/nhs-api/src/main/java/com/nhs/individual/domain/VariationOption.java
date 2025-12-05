package com.nhs.individual.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "variation_option")
public class VariationOption {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false,cascade = CascadeType.MERGE)
    @JoinColumn(name = "variation_id", nullable = false)
    @JsonIgnoreProperties("options")
    private Variation variation;

    @ManyToMany(mappedBy = "options")
    @JsonIgnore
    private List<ProductItem> productItems;


    @Column(name = "value", length = 45)
    private String value;
}