package com.nhs.individual.views.EmbeddedId;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.sql.Date;

@Getter
@Setter
@Embeddable
@AllArgsConstructor
@NoArgsConstructor
public class ProductDateId implements Serializable {
    @Column(name = "product_id")
    private Integer productId;
    @Column(name = "date")
    private Date date;

}
