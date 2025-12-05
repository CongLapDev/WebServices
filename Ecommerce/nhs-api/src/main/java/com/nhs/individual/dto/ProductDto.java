package com.nhs.individual.dto;

import com.nhs.individual.domain.Category;
import com.nhs.individual.domain.Product;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;

import java.io.Serializable;

/**
 * DTO for {@link Product}
 */
@AllArgsConstructor
@Getter
@ToString
public class ProductDto implements Serializable {
    private final Integer id;
    @NotNull(message = "Product's name is required")
    private final String name;
    private final String description;
    private final String picture;
    private final String manufacturer;
    private final Category category;
    public ProductDto(Product product){
        this.id = product.getId();
        this.name = product.getName();
        this.description = product.getDescription();
        this.picture = product.getPicture();
        this.manufacturer=product.getManufacturer();
        this.category=product.getCategory();

    }
}