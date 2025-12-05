package com.nhs.individual.controller;

import com.nhs.individual.domain.Variation;
import com.nhs.individual.domain.VariationOption;
import com.nhs.individual.exception.ResourceNotFoundException;
import com.nhs.individual.service.VariationOptionService;
import com.nhs.individual.service.VariationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;

@RestController
@RequestMapping(value = "/api/v1/variation")
public class VariationController {
    @Autowired
    VariationService variationService;
    @Autowired
    VariationOptionService variationOptionService;
    @RequestMapping(method=RequestMethod.GET)
    public Collection<Variation> getAll() {
        return variationService.findAll();
    }
    @RequestMapping(method = RequestMethod.POST)
    @PreAuthorize("hasAuthority('ADMIN')")
    public Variation create(@RequestBody Variation variation) {
        return variationService.save(variation);
    }

    @RequestMapping(value = "/{variation_id}", method = RequestMethod.GET)
    public Variation getById(@PathVariable(name = "variation_id") Integer variationId) {
        return variationService.findById(variationId).orElseThrow(()->new ResourceNotFoundException("Could not find variation"));
    }
    @RequestMapping(value = "/{variation_id}", method = RequestMethod.PUT)
    @PreAuthorize("hasAuthority('ADMIN')")
    public Variation updateById(@PathVariable(name = "variation_id") Integer variationId,
                                @RequestBody Variation variation) {
        return variationService.updateById(variationId,variation);
    }
    @RequestMapping(value = "/{variation_id}", method = RequestMethod.DELETE)
    @PreAuthorize("hasAuthority('ADMIN')")
    public void deleteById(@PathVariable(name = "variation_id") Integer variationId) {
        variationService.deleteById(variationId);
    }

    @RequestMapping(value = "/{variation_id}/option",method = RequestMethod.GET)
    public Collection<VariationOption> findAll(
            @PathVariable(name = "variation_id") Integer variationId
    ) {
        return variationOptionService.findAllByVariationId(variationId);
    }
    @RequestMapping(value = "/{variation_id}/option",method = RequestMethod.POST)
    @PreAuthorize("hasAuthority('ADMIN')")
    public VariationOption createVariationOption(
            @RequestBody VariationOption variationOption,
            @PathVariable(name = "variation_id") Integer variationId){
        Variation variation=new Variation();
        variation.setId(variationId);
        variationOption.setVariation(variation);
        return variationOptionService.save(variationOption);
    }


}
