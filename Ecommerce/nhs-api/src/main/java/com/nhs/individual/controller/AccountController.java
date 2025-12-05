package com.nhs.individual.controller;

import com.nhs.individual.constant.AccountStatus;
import com.nhs.individual.responsemessage.ResponseMessage;
import com.nhs.individual.service.AccountService;
import lombok.AllArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/v1/account")
@AllArgsConstructor
public class AccountController {
    AccountService accountService;
    @RequestMapping(value = "/{id}/status/INACTIVE",method = RequestMethod.PUT)
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or authentication.principal.id==#id ")
    public ResponseMessage inactiveAccount(@PathVariable Integer id){
        return accountService.updateAccountStatus(id,AccountStatus.INACTIVE);
    }
    @RequestMapping(value = "/{id}/status/ACTIVE",method = RequestMethod.PUT)
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or authentication.principal.id==#id")
    public ResponseMessage activeAccount(@PathVariable Integer id){
        return accountService.updateAccountStatus(id,AccountStatus.ACTIVE);
    }
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or authentication.principal.id==#id")
    @RequestMapping(value = "/{id}/status/LOCK",method = RequestMethod.PUT)
    public ResponseMessage lockAccount(@PathVariable(name = "id") Integer id){
        return accountService.updateAccountStatus(id,AccountStatus.LOCKED);
    }
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or authentication.principal.id==#id")
    @RequestMapping(value = "/{id}/status/VERIFYING",method = RequestMethod.PUT)
    public ResponseMessage verifyingAccount(@PathVariable(name = "id") Integer id){
        return accountService.updateAccountStatus(id,AccountStatus.VERIFYING);
    }
}
