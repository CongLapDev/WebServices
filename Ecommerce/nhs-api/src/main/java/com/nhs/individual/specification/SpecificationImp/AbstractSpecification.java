package com.nhs.individual.specification.SpecificationImp;
import com.nhs.individual.specification.DynamicSearch;
import com.nhs.individual.specification.ISpecification.GeneralSpecification;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;


public abstract class AbstractSpecification<T> implements GeneralSpecification<T> {
    private final DynamicSearch criteria;

    protected AbstractSpecification(DynamicSearch criteria) {
        this.criteria = criteria;
    }

    @Override
    public Predicate toPredicate(Root<T> root, CriteriaQuery<?> query, CriteriaBuilder builder) {
        if (criteria.getOperation()== DynamicSearch.Operator.GTE) {
            return builder.greaterThanOrEqualTo(
                    root.<String> get(criteria.getKey()), criteria.getValue().toString());
        }
        else if (criteria.getOperation()==DynamicSearch.Operator.LTE) {
            return builder.lessThanOrEqualTo(
                    root.<String> get(criteria.getKey()), criteria.getValue().toString());
        }
        else if (criteria.getOperation()==DynamicSearch.Operator.LIKE) {
            if (root.get(criteria.getKey()).getJavaType() == String.class) {
                return builder.like(
                        root.<String>get(criteria.getKey()), "%" + criteria.getValue() + "%");
            } else {
                return builder.equal(root.get(criteria.getKey()), criteria.getValue());
            }
        }
        else if(criteria.getOperation()==DynamicSearch.Operator.LT){
            return builder.lessThan(
                    root.<String>get(criteria.getKey()),criteria.getValue().toString());
        }else if(criteria.getOperation()==DynamicSearch.Operator.GT){
            return builder.greaterThan(
                    root.<String>get(criteria.getKey()),criteria.getValue().toString());
        }
        return null;
    }
}
