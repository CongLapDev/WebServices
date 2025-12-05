package com.nhs.individual.dto;

import com.nhs.individual.domain.ShopOrder;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

/**
 * DTO for {@link com.nhs.individual.domain.ShopOrder}
 */
@AllArgsConstructor
@Getter
@ToString
public class ShopOrderDto implements Serializable {
    private final Integer id;
    private final Integer userId;
    private final Date orderDate;
    @Min(message = "Total value can not be negative or equal to 0", value = 1)
    private final BigDecimal total;
    private final String note;
    public ShopOrderDto(ShopOrder shopOrder){
        id=shopOrder.getId();
        userId=shopOrder.getUserId();
        orderDate=shopOrder.getOrderDate();
        total=shopOrder.getTotal();
        note=shopOrder.getNote();
    }
}