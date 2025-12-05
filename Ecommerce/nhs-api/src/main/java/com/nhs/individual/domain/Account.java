package com.nhs.individual.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.nhs.individual.constant.AccountProvider;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.ToString;

import java.util.Collection;


@Entity
@Table(name = "account")
@Data
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @OneToOne(fetch = FetchType.EAGER, optional = false,cascade = {CascadeType.PERSIST,CascadeType.MERGE})
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties("account")
    @ToString.Exclude
    private User user;

    @Column(name = "username", length = 45)
    @NotBlank
    private String username;

    @Column(name = "password")
    @NotBlank
    private String password;
    @Column(name="status",columnDefinition = "TINYINT(1)")
    Integer status;
    @Column(name = "provider")
    AccountProvider provider;


    @ManyToMany(fetch = FetchType.EAGER,cascade = {CascadeType.REFRESH,CascadeType.DETACH,CascadeType.MERGE})
    @JoinTable(name = "account_role",
    joinColumns = @JoinColumn(name = "account_id"),
    inverseJoinColumns = @JoinColumn(name = "role_id"))
    @JsonIgnoreProperties("accounts")
    private Collection<Role> roles;

    @OneToMany(mappedBy = "account",fetch = FetchType.LAZY,cascade = CascadeType.ALL)
    @JsonIgnore
    private Collection<RefreshToken> refreshToken;
}