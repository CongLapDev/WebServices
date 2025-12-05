package com.nhs.individual.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.nhs.individual.exception.InvalidTokenException;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
public class RefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Column(nullable = false,unique = true)
    @NotBlank
    @NotNull
    private String token;
    @NotNull
    private Instant expiredDate;
    @ManyToOne( cascade = CascadeType.MERGE,fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    @JsonIgnoreProperties("refreshToken")
    private Account account;

    public static class Builder{
        RefreshToken refreshToken;

        public Builder() {
            refreshToken=new RefreshToken();
        }
        public Builder(Account account){
            refreshToken=new RefreshToken();
            refreshToken.setAccount(account);
            refreshToken.setExpiredDate(Instant.now());
            refreshToken.setToken(UUID.randomUUID().toString());
        }
        public Builder token(String token){
            refreshToken.setToken(token);
            return this;
        }
        public Builder expiredDate(Instant date){
            refreshToken.setExpiredDate(date);
            return this;
        }
        public Builder account(Account account){
            refreshToken.setAccount(account);
            return this;
        }

        public RefreshToken build(){
            if(refreshToken.getAccount()==null||refreshToken.getToken()==null||refreshToken.getExpiredDate()==null){
                throw new InvalidTokenException("Error when create refresh token");
            }else{
                return refreshToken;
            }
        }
    }
}
