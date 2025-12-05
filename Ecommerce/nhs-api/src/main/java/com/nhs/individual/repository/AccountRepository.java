package com.nhs.individual.repository;

import com.nhs.individual.domain.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Integer> {
    Optional<Account> findAccountByUsername(String username);
    @Modifying
    @Query(value = "update account set account.status=?2 where account.id=?1", nativeQuery = true)
    Integer updateAccountStatusById(Integer accountId,Integer status);

}
