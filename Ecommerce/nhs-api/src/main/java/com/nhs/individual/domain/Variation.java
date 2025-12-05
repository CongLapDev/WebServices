package com.nhs.individual.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "variation")
public class Variation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;


    @OneToMany(mappedBy = "variation",fetch = FetchType.EAGER,cascade = CascadeType.ALL)
    @JsonIgnoreProperties("variation")
    private List<VariationOption> options;

    @Column(name = "name", length = 45)
    private String name;

}