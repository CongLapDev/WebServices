package com.nhs.individual.views;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Immutable;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Mapping for DB view
 */
@Getter
@Setter
@Entity
@Immutable
@Table(name = "prospectiveuser")
public class Prospectiveuser {
    @Id
    @NotNull
    @Column(name = "id", nullable = false)
    private Integer id;

    @Size(max = 12)
    @Column(name = "phone_number", length = 12)
    private String phoneNumber;

    @Size(max = 255)
    @Column(name = "email")
    private String email;

    @Size(max = 45)
    @Column(name = "firstname", length = 45)
    private String firstname;

    @Size(max = 45)
    @Column(name = "lastname", length = 45)
    private String lastname;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Size(max = 10)
    @Column(name = "gender", length = 10)
    private String gender;

    @Size(max = 255)
    @Column(name = "picture")
    private String picture;

    @Column(name = "total_amount", precision = 40, scale = 2)
    private BigDecimal totalAmount;

    @NotNull
    @Column(name = "total_order", nullable = false)
    private Long totalOrders;

    @Column(name = "user_id")
    private Integer userId;

}