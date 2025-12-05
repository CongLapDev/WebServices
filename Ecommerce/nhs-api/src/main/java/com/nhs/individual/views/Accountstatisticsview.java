package com.nhs.individual.views;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Immutable;

import java.math.BigDecimal;

/**
 * Mapping for DB view
 */
@Getter
@Setter
@Entity
@Immutable
@Table(name = "accountstatisticsview")
public class Accountstatisticsview {
    @Id
    @NotNull
    @Column(name = "total_accounts", nullable = false)
    private Long totalAccounts;

    @Column(name = "total_status_1", precision = 22)
    private BigDecimal totalStatus1;

    @Column(name = "total_status_2", precision = 22)
    private BigDecimal totalStatus2;

    @Column(name = "total_status_3", precision = 22)
    private BigDecimal totalStatus3;

}