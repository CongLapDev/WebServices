package com.nhs.individual.controller;

import com.nhs.individual.domain.Address;
import com.nhs.individual.exception.ResourceNotFoundException;
import com.nhs.individual.service.AddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;

@RestController
@RequestMapping("/api/v1/address")
public class AddressController {
    @Autowired
    AddressService addressService;
    @RequestMapping(method = RequestMethod.POST)
    public Address createAddress(@RequestBody Address address){
        return addressService.save(address);
    }
    @RequestMapping(value = "/{id}",method=RequestMethod.GET)
    public ResponseEntity<?> findById(@PathVariable(name = "id",required = false) Integer id){
        if(id!=null) return ResponseEntity.ok(addressService.findById(id).orElseThrow(()->  new ResourceNotFoundException("Could not find address with id: "+id)));
        return ResponseEntity.ok(addressService.findAll());
    }
    @RequestMapping(method = RequestMethod.GET)
    public Collection<Address> findAll(){
        return addressService.findAll();
    }
    @RequestMapping(value = "/{id}",method = RequestMethod.PUT)
    public Address updateById(@PathVariable(name = "id",required = false) Integer id,
                                @RequestBody Address address){
        return addressService.update(id, address);
    }
    @RequestMapping(value = "/{id}",method = RequestMethod.DELETE)
    public void deleteAddressById(@PathVariable(name = "id",required = false) Integer id){
        addressService.deleteById(id);
    }

}

