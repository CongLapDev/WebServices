package com.nhs.individual.controller;

import com.nhs.individual.domain.UserAddress;
import com.nhs.individual.domain.UserAddressId;
import com.nhs.individual.service.UserAddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;

@RestController
@RequestMapping(value = "/api/v1/user")
public class UserAddressController {
    @Autowired
    private UserAddressService userAddressService;

    @RequestMapping( value="/{userId}/address",method = RequestMethod.GET)
    public Collection<UserAddress> findAllByUserId( @PathVariable(name = "userId") Integer userId) {
        return userAddressService.findAllByUserId(userId);
    }
    @RequestMapping(value = "/address", method = RequestMethod.POST)
    @PreAuthorize("#userAddress.user.id==authentication.principal.userId or hasRole('ROLE_ADMIN')")
    public UserAddress createUserAddress( @RequestBody UserAddress userAddress) {
        return userAddressService.create(userAddress);
    }
    @RequestMapping(value="/{userId}/address/{id}/default",method = RequestMethod.PUT)
    @PreAuthorize("#userId==authentication.principal.userId or hasAuthority('ROLE_ADMIN')")
    public UserAddress getById(@PathVariable(name = "id") Integer id,
                        @PathVariable(name = "userId") Integer userId) {
        return userAddressService.setDefaultAddress(userId,id);
    }

    @RequestMapping(value="/{userId}/address/{id}",method = RequestMethod.DELETE)
    @PreAuthorize("#userId==authentication.principal.userId or hasAuthority('ROLE_ADMIN')")
    public UserAddressId deleteUserAddress(@PathVariable Integer id,
                                  @PathVariable(name = "userId") Integer userId) {
        return userAddressService.deleteById(new UserAddressId(userId,id));
    }

}
