package com.nhs.individual.controller;

import com.nhs.individual.service.sub_service.ProductOverviewService;
import com.nhs.individual.specification.ISpecification.IProductSpecificationV2;
import com.nhs.individual.views.ProductOverView;
import jakarta.annotation.security.PermitAll;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping(value = "/api/v2/product")
@AllArgsConstructor
public class ProductControllerV2 {
    private ProductOverviewService productOverviewService;
    @RequestMapping( method = RequestMethod.GET)
    @PermitAll
    public Page<ProductOverView> getProducts(
            @RequestParam(name = "category", required = false) List<Integer> category,
            @RequestParam(name = "price-max", required = false) BigDecimal priceMax,
            @RequestParam(name = "price-min", required = false) BigDecimal priceMin,
            @RequestParam(name = "page", defaultValue = "0", required = false) Integer page,
            @RequestParam(name = "size", defaultValue = "20", required = false) Integer size,
            @RequestParam(name = "name", required = false) String name,
            @RequestParam(name="orderBy",required=false) List<String> orderBy,
            @RequestParam(name="order",required=false,defaultValue = "ASC") Sort.Direction order) {
        List<Specification<ProductOverView>> specifications = new ArrayList<>();
        if (category != null) specifications.add(IProductSpecificationV2.inCategory(category));
        if (priceMin != null && priceMax != null)
            specifications.add(IProductSpecificationV2.priceLimit(priceMin, priceMax));
        if(name!=null) specifications.add(IProductSpecificationV2.relativeName(name));
        PageRequest pageRequest=PageRequest.of(page,size);
        Sort sort;
        if(orderBy!=null&&!orderBy.isEmpty()) {
            String[] orders = orderBy.toArray(new String[0]);
            sort= Sort.by(orders);
            if(order==Sort.Direction.ASC) sort=sort.ascending();
            else if(order==Sort.Direction.DESC) sort=sort.descending();
            pageRequest=pageRequest.withSort(sort);
        }
        return productOverviewService.findAll(specifications,pageRequest);
    }

}
