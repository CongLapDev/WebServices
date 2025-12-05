package com.nhs.individual.repository;

import com.nhs.individual.domain.User;
import io.micrometer.common.lang.NonNull;
import io.micrometer.common.lang.Nullable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User,Integer> {
    @Query(value = "select * from user where id in (select user_id from account  where id=?1) ",nativeQuery = true)
    User findByAccount_id(int accountId);
    @NonNull
    Page<User> findAll(@Nullable Specification<User> specification, @NonNull Pageable pageable);
    @Query(value = "select * from user where (email=?1 or phone_number=?2) and ?1 is not null and ?2 is not null and trim(?1)<>'' and trim(?2)<>''",nativeQuery = true)
    Optional<User> findAllByEmailOrPhoneNumber(String email, String phoneNumber);

    @Query(value = "select * from user where id<>?1 and (email=?2 or phone_number=?3) and ?2 is not null and ?3 is not null and trim(?2)<>'' and trim(?3)<>''",nativeQuery = true)
    Optional<User> findAllByEmailOrPhoneNumber(Integer userId,String email, String phoneNumber);
}
