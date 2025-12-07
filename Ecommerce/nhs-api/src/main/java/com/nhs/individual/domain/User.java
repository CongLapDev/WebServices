package com.nhs.individual.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.nhs.individual.dto.AccountDto;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.validator.constraints.Length;

import java.sql.Date;
import java.util.Collection;

@Getter
@Setter
@Entity
@Table(name = "user")
@ToString
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    protected Integer id;

    @Column(name = "firstname", length = 45)
    @Length(min=1,max = 45,message = "First name is between 1 and 45 characters in length")
    protected String firstname;

    @Column(name = "lastname", length = 45)
    @Length(min=1,max = 45,message = "Last name is between 1 and 45 characters in length")

    protected String lastname;

    @Column(name = "date_of_birth")
    protected Date dateOfBirth;

    @Column(name = "gender", length = 10)
    protected String gender;

    @Column(name = "phone_number", length = 12)
    protected String phoneNumber;

    @Column(name = "email")
    protected String email;

    @Column(name = "picture")
    protected String picture;

    @OneToMany(mappedBy = "user",fetch = FetchType.LAZY,cascade = CascadeType.ALL)
    @JsonIgnore
    @ToString.Exclude
    protected Collection<UserAddress> userAddresses;
    @OneToOne(mappedBy = "user",fetch = FetchType.EAGER,cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"user","hibernateLazyInitializer","handler"})
    @ToString.Exclude
    protected Account account;

    public Account getAccount() {
        return new AccountDto(account);
    }
}