package com.nhs.individual.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "category")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "name", length = 45)
    @NotBlank(message = "Category name is required")
    private String name;

    @Column(name = "description")
    @NotBlank(message = "Category description is required")
    private String description;
    @ManyToOne(fetch = FetchType.LAZY,cascade = CascadeType.MERGE)
    @JoinColumn(name = "parent_category_id")
    @JsonIgnoreProperties({"children","variations","hibernateLazyInitializer", "handler"})
    private Category parent;

    @OneToMany(mappedBy = "parent",fetch = FetchType.LAZY,cascade = {CascadeType.MERGE,CascadeType.DETACH,CascadeType.PERSIST,CascadeType.REMOVE})
    @JsonIgnoreProperties({"parent","hibernateLazyInitializer", "handler"})
    private List<Category> children;


    @OneToMany(mappedBy = "category",fetch = FetchType.LAZY,cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"category", "hibernateLazyInitializer", "handler"})
    private List<Product> products;
}