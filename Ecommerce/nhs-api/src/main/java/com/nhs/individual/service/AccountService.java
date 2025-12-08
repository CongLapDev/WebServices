package com.nhs.individual.service;

import com.nhs.individual.constant.AccountProvider;
import com.nhs.individual.constant.AccountRole;
import com.nhs.individual.constant.AccountStatus;
import com.nhs.individual.domain.Account;
import com.nhs.individual.domain.Role;
import com.nhs.individual.exception.DataException;
import com.nhs.individual.repository.AccountRepository;
import com.nhs.individual.repository.RoleRepository;
import com.nhs.individual.responsemessage.ResponseMessage;
import org.hibernate.NonUniqueObjectException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AccountService {
    private static final Logger log = LoggerFactory.getLogger(AccountService.class);
    
    @Autowired
    AccountRepository repository;
    
    @Autowired
    RoleRepository roleRepository;
    
    BCryptPasswordEncoder passwordEncoder=new BCryptPasswordEncoder();

    public Account create(Account account){
        // Load role from database to ensure name is set
        Role role = roleRepository.findById(AccountRole.USER.id)
                .orElseGet(() -> {
                    log.warn("[AccountService] Role with ID {} not found in database. Creating default USER role.", AccountRole.USER.id);
                    // Fallback: create role with name set
                    Role defaultRole = new Role();
                    defaultRole.setId(AccountRole.USER.id);
                    defaultRole.setName("USER");
                    return defaultRole;
                });
        
        // Ensure role name is not null
        if (role.getName() == null || role.getName().trim().isEmpty()) {
            log.warn("[AccountService] Role ID {} has null or empty name. Setting to 'USER'.", role.getId());
            role.setName("USER");
        }
        
        log.debug("[AccountService] Creating account with role: id={}, name={}", role.getId(), role.getName());
        
        account.setPassword(passwordEncoder.encode(account.getPassword()));
        account.setProvider(AccountProvider.SYSTEM);
        findByUsername(account.getUsername()).ifPresent((account1)->{
            throw new NonUniqueObjectException("Account's username already exists",account.getUsername());
        });
        account.setStatus(AccountStatus.ACTIVE.id);
        
        // Ensure account has at least one role
        if (account.getRoles() == null || account.getRoles().isEmpty()) {
            account.setRoles(List.of(role));
        } else {
            // Validate and fix existing roles
            List<Role> validRoles = new ArrayList<>();
            for (Role r : account.getRoles()) {
                if (r != null) {
                    // Load role from DB if only ID is set
                    if (r.getName() == null && r.getId() > 0) {
                        Role loadedRole = roleRepository.findById(r.getId())
                                .orElse(r);
                        if (loadedRole.getName() != null) {
                            r = loadedRole;
                        } else {
                            log.warn("[AccountService] Role ID {} has null name. Setting to 'USER'.", r.getId());
                            r.setName("USER");
                        }
                    }
                    // Ensure name is set
                    if (r.getName() == null || r.getName().trim().isEmpty()) {
                        r.setName("USER");
                    }
                    validRoles.add(r);
                }
            }
            // If no valid roles, add default USER role
            if (validRoles.isEmpty()) {
                validRoles.add(role);
            }
            account.setRoles(validRoles);
        }
        
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
