package com.nhs.individual.specification.ISpecification;

import com.nhs.individual.views.OrderPerDay;
import com.nhs.individual.views.OrderPerDay_;
import org.springframework.data.jpa.domain.Specification;

import java.sql.Date;

public interface OrderPerDaySpecification extends Specification<OrderPerDay> {
    static Specification<OrderPerDay> between(Date from, Date to) {
        return (root,cq,cb)->cb.between(root.get(OrderPerDay_.DATE), from, to);
    }

}
