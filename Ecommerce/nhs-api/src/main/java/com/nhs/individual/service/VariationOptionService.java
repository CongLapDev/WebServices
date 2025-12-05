package com.nhs.individual.service;

import com.nhs.individual.domain.Variation;
import com.nhs.individual.domain.VariationOption;
import com.nhs.individual.exception.ResourceNotFoundException;
import com.nhs.individual.repository.VariationOptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Optional;

@Service
public class VariationOptionService {
    @Autowired
    VariationOptionRepository variationOptionRepository;
    @Autowired
    VariationService variationService;
    public Collection<VariationOption> findAllByVariationId(Integer variationId) {
        return variationService
                .findById(variationId)
                .map(Variation::getOptions)
                .orElseThrow(()->new ResourceNotFoundException("Variation with id " + variationId + " does not exist"));
    }
    public VariationOption save(VariationOption variationOption){
        return variationOptionRepository.save(variationOption);
    }
    public Optional<VariationOption> findById(int id){
        return variationOptionRepository.findById(id);
    }
    public void deleteById(int id){
        variationOptionRepository.deleteById(id);
    }
    public VariationOption update(Integer id,VariationOption variationOption) throws ChangeSetPersister.NotFoundException {
        return variationOptionRepository.save(findById(id).map(oldVariationOption->{
            oldVariationOption.setValue(variationOption.getValue());
            return oldVariationOption;
        }).orElseThrow(ChangeSetPersister.NotFoundException::new));
    }
}
