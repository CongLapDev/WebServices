package com.nhs.individual.views;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Subselect;

@Getter
@Setter
@Immutable
@Entity
@Subselect("select ( select count(*) from product ) as number_of_products,\n" +
        "       (select count(*) from user) as number_of_users,\n" +
        "       (select count(*) from warehouse) as number_of_warehouse,\n" +
        "       (select count(*) from category) as number_of_category,\n" +
        "       (select sum(total) from shop_order\n" +
        "                                     where  MONTH(order_date) = MONTH(CURRENT_DATE)-1\n" +
        "                                            AND YEAR(order_date) = YEAR(CURRENT_DATE)\n" +
        "                                            AND 5=(select status from shop_order_status\n" +
        "                                                          where shop_order_id=shop_order.id\n" +
        "                                                          order by update_at desc\n" +
        "                                                          limit 1))\n" +
        "        as revenue,\n" +
        "        (select count(*) from payment_method) as available_payment_method\n" +
        "\n")
public class OverviewStatistic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long number_of_products;
    private Long number_of_users;
    private Long number_of_warehouse;
    private Long number_of_category;
    private Long revenue;
    private Long available_payment_method;
}
