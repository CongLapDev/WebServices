package com.nhs.individual.dto;

import com.nhs.individual.constant.AccountProvider;
import com.nhs.individual.domain.Account;
import com.nhs.individual.domain.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;

import java.io.Serializable;
import java.util.Collection;

/**
 * DTO for {@link Account}
 */
@AllArgsConstructor
@Getter
@ToString
public class AccountDto  extends Account implements Serializable {
    private Integer id;
    private String username;
    private Integer status;
    private AccountProvider provider;
    private Collection<Role> roles;
    public AccountDto(Account account){
        this.id=account.getId();
        this.username=account.getUsername();
        this.status=account.getStatus();
        this.provider=account.getProvider();
        this.roles=account.getRoles();
    }
}