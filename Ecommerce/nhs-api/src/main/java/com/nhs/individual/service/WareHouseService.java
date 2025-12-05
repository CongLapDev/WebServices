package com.nhs.individual.service;

import com.nhs.individual.domain.ProductItem;
import com.nhs.individual.domain.Warehouse;
import com.nhs.individual.exception.ResourceNotFoundException;
import com.nhs.individual.repository.WareHouseRepository;
import com.nhs.individual.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Optional;

@Service
public class WareHouseService {
    @Autowired
    WareHouseRepository wareHouseRepository;
    public Warehouse create(Warehouse wareHouse){
        return wareHouseRepository.save(wareHouse);
    }
    public Collection<Warehouse> findAll(){
        return wareHouseRepository.findAll();
    }
    public Optional<Warehouse> findById(int id){
        return wareHouseRepository.findById(id);
    }
    public void deleteById(int id){
        wareHouseRepository.deleteById(id);
    }
    public Warehouse update(Integer id,Warehouse wareHouse){
        return wareHouseRepository.save(findById(id).map(oldWareHouse->{
            return ObjectUtils.merge(oldWareHouse,wareHouse, Warehouse.class);
        }).orElseThrow(()->new ResourceNotFoundException("warehouse not found")));
    }
    public void transport(ProductItem productItem,Warehouse origin,Warehouse destination,int qty){

    }
}
