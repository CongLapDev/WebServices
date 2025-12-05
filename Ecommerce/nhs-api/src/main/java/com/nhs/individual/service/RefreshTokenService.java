package com.nhs.individual.service;

import com.nhs.individual.domain.Account;
import com.nhs.individual.domain.RefreshToken;
import com.nhs.individual.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {
    @Value("${nhs.token.refreshTokenms}")
    private int refreshTokenExpiredTime;
    @Value("${nhs.token.accessTokenms}")
    private int accessTokenExpriredTime;
    @Autowired
    private RefreshTokenRepository refreshTokenRepository;
    @Transactional
    public RefreshToken generateRefreshToken(Account account){
        RefreshToken refreshToken=new RefreshToken.Builder()
                .account(account)
                .token(UUID.randomUUID().toString())
                .expiredDate(Instant.now().plusMillis(refreshTokenExpiredTime))
                .build();
        if(refreshTokenRepository.findByAccount_id(account.getId()).isPresent()){
            refreshTokenRepository.updateRefreshTokenByAccount_id(account.getId(), refreshToken.getToken());
            return refreshToken;
        }
        return refreshTokenRepository.save(refreshToken);
    }
    @Transactional
    public void deleteByAccountId(Integer id){
        refreshTokenRepository.deleteAllByAccount_Id(id);
    }
    public boolean verify(RefreshToken refreshToken){
        if(refreshToken.getExpiredDate().isAfter(Instant.now().plusMillis(refreshTokenExpiredTime))){
            refreshTokenRepository.delete(refreshToken);
            return false;
        }
        return true;
    }
    public Optional<RefreshToken> findByToken(String token){
        return refreshTokenRepository.findByToken(token);
    }
    public void deleteById(int id){
        refreshTokenRepository.deleteById(id);
    }

}
