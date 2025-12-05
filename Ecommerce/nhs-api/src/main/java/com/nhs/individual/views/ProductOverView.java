package com.nhs.individual.views;

import com.nhs.individual.domain.Category;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Subselect;

@Getter
@Setter
@Entity
@Immutable
@Subselect(value = "select pd.id,pd.picture,pd.category_id,pd.description,pd.name,pd.manufacturer,\n" +
        "avg(cmt.rate) as rate,\n" +
        "min(pdi.price) as min_price,\n" +
        "max(pdi.price) as max_price,\n" +
        "sum(warehouse.quantity) as quantity\n," +
        "count(cmt.rate) as rate_count "+
        "from product pd\n" +
        "left join comment cmt on pd.id = cmt.product_id\n" +
        "left join product_item pdi on pdi.product_id=pd.id\n" +
        "left join product_item_in_warehouse warehouse on pdi.id = warehouse.product_item_id\n" +
        "group by pd.id\n")
public class ProductOverView {
    @Id
    private Integer id;
    private String picture;
    private String description;
    private String name;
    private String manufacturer;
    private Double rate;
    private Integer rate_count;
    private Double min_price;
    private Double max_price;
    private Double quantity;
    @Column(name = "category_id",insertable = false,updatable = false)
    private Integer categoryId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;
}
