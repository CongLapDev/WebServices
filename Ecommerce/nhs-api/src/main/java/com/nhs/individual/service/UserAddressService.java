package com.nhs.individual.service;

import com.nhs.individual.domain.Address;
import com.nhs.individual.domain.UserAddress;
import com.nhs.individual.domain.UserAddressId;
import com.nhs.individual.repository.UserAddressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;
import java.util.Optional;


@Service
public class UserAddressService {
    @Autowired
    UserAddressRepository userAddressRepository;
    @Autowired
    UserService userService;
    @Autowired
    AddressService addressService;
    public Collection<UserAddress> findAllByUserId(Integer id) {
        return userAddressRepository.findAllByUser_id(id);
    }

    @Transactional
    public UserAddress create(UserAddress userAddress) {
        Address address=addressService.save(userAddress.getAddress());
        userAddressRepository.deSelectDefaultAddress(userAddress.getUser().getId());
        return userService.findById(userAddress.getUser().getId()).map((user)->{
            UserAddressId userAddressId=new UserAddressId(userAddress.getUser().getId(),address.getId());
            userAddress.setId(userAddressId);
            userAddress.setUser(user);
            userAddress.setIsDefault(true);
            userAddress.setAddress(address);
            return userAddressRepository.save(userAddress);
        }).orElseThrow(()->new RuntimeException("Could not find user"));
    }
    public Optional<UserAddress> findByUseridAndAddressid(Integer userId,Integer addressid) {
        return userAddressRepository.findAllByUser_idAndAddress_id(userId,addressid);
    }
    public UserAddress update(Integer id,UserAddress userAddress) {
        return userAddressRepository.save(userAddress);
    }
    public UserAddressId deleteById(UserAddressId userAddressId) {
        userAddressRepository.deleteById(userAddressId);
        return userAddressId;
    }
    public void setDefaultUserAddress(UserAddress userAddress){
        List<UserAddress> userAddressList= findAllByUserId(userAddress.getId().getUserId()).stream().peek(address->{
            address.setIsDefault(address.getId().equals(userAddress.getId()));
        }).toList();
        userAddressRepository.saveAll(userAddressList);
    }
    public void setBusinessAddress(Integer userAddressId){
        userAddressRepository.updateBusinessAddress(userAddressId);
    }
    @Transactional
    public UserAddress setDefaultAddress(Integer userId,Integer  addressId){
        return  userAddressRepository.updateDefaultAddressByAddressId(userId,addressId);
    }
}
