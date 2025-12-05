package com.nhs.individual.repository;

import com.nhs.individual.domain.UserAddress;
import com.nhs.individual.domain.UserAddressId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;

@Repository
public interface UserAddressRepository extends JpaRepository<UserAddress, UserAddressId> {
    Collection<UserAddress> findAllByUser_id(Integer userid);
    Optional<UserAddress> findAllByUser_idAndAddress_id(Integer userId,Integer addressId);

    @Procedure(procedureName = "setDefaultUserAddress")
    UserAddress updateDefaultAddressByAddressId(Integer userId,Integer addressId);

    @Modifying
    @Query(value = "UPDATE user_address SET is_business=true where user_id=?1",nativeQuery = true)
    void updateBusinessAddress(Integer addressId);
    @Modifying
    @Query(value = "UPDATE user_address SET is_default=false where user_id=?1",nativeQuery = true)
    void deSelectDefaultAddress(Integer userId);
}
