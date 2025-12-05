package com.nhs.individual.service;

import com.nhs.individual.domain.Variation;
import com.nhs.individual.exception.ResourceNotFoundException;
import com.nhs.individual.repository.VariationRepository;
import com.nhs.individual.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Optional;

@Service
public class VariationService {
    @Autowired
    VariationRepository variationRepository;
    @Autowired
    CategoryService categoryService;

    public Variation save(Variation variation){
        return variationRepository.save(variation);
    }
    public Collection<Variation> findAll(){
        return variationRepository.findAll();
    }
    public Variation updateById(int variationId,Variation variation){
        return variationRepository.save(findById(variationId).map(oldVariation->{
            oldVariation.setName(variation.getName());
            return variationRepository.save(ObjectUtils.merge(oldVariation,variation,Variation.class));
        }).orElseThrow(()->new ResourceNotFoundException("Could not find variation")));
    }
    public Optional<Variation> findById(int id){
        return variationRepository.findById(id);
    }
    public void deleteById(int id){
        variationRepository.deleteById(id);
    }
    public Collection<Variation> saveAll(Collection<Variation> variants){
        return variationRepository.saveAll(variants);
    }
}
