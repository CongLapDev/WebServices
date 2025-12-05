package com.nhs.individual.service;

import com.nhs.individual.constant.AccountProvider;
import com.nhs.individual.constant.AccountRole;
import com.nhs.individual.constant.AccountStatus;
import com.nhs.individual.domain.Account;
import com.nhs.individual.domain.Role;
import com.nhs.individual.exception.DataException;
import com.nhs.individual.repository.AccountRepository;
import com.nhs.individual.responsemessage.ResponseMessage;
import org.hibernate.NonUniqueObjectException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AccountService {
    @Autowired
    AccountRepository repository;
    BCryptPasswordEncoder passwordEncoder=new BCryptPasswordEncoder();

    public Account create(Account account){
        Role role=new Role();
        role.setId(AccountRole.USER.id);
        account.setPassword(passwordEncoder.encode(account.getPassword()));
        account.setProvider(AccountProvider.SYSTEM);
        findByUsername(account.getUsername()).ifPresent((account1)->{
            throw new NonUniqueObjectException("Account's username already exists",account.getUsername());
        });
        account.setStatus(AccountStatus.ACTIVE.id);
        account.setRoles(List.of(role));
        return repository.save(account);
    }
    public Optional<Account> findById(int id){
        return repository.findById(id);
    }
    public Optional<Account> findByUsername(String username){
        return repository.findAccountByUsername(username);
    }

    @Transactional
    public ResponseMessage updateAccountStatus(Integer accountId, AccountStatus status){
        System.out.println("test");
        Integer accountStatus = repository.updateAccountStatusById(accountId,status.id);
        if(accountStatus==1) return ResponseMessage.builder().message("Update status successfully").ok();
        else throw new DataException("Could not update account status");
    }
}
