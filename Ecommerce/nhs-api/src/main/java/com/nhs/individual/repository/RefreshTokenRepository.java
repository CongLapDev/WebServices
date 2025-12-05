package com.nhs.individual.repository;

import com.nhs.individual.domain.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken,Integer> {
    Optional<RefreshToken> findByToken(String token);
    Optional<RefreshToken> findByAccount_id(Integer accountId);

    @Modifying
    @Query(value = "update refresh_token set token=?2 where account_id=?1",nativeQuery = true)
    void updateRefreshTokenByAccount_id(Integer accountId,String token);
    @Modifying
    void deleteAllByAccount_Id(Integer accountId);
}
