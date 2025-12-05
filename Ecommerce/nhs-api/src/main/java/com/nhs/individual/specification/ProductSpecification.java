package com.nhs.individual.specification;

import com.nhs.individual.domain.Product;
import com.nhs.individual.specification.SpecificationImp.AbstractSpecification;

public class ProductSpecification extends AbstractSpecification<Product> {
    public ProductSpecification(DynamicSearch criteria) {
        super(criteria);
    }
}
