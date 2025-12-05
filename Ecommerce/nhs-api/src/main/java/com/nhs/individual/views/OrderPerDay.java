package com.nhs.individual.views;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Subselect;

import java.sql.Date;
import java.util.List;

@Getter
@Setter
@Immutable
@Entity
@Subselect("select count(*) as number_orders_day\n" +
        "           ,date_format(shop_order.order_date,\"%Y-%m-%d\") as date\n" +
        "      from shop_order\n" +
        "      group by date")
public class OrderPerDay {
    @Id
    private Date date;
    private Integer number_orders_day;

    @OneToMany(mappedBy = "orderPerDay")
    private List<MostProductOrder> products;
}
