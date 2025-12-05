package com.nhs.individual.dto;

import com.nhs.individual.domain.Category;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;

import java.io.Serializable;

/**
 * DTO for {@link Category}
 */
@AllArgsConstructor
@Getter
@ToString
public class CategoryDto implements Serializable {
    private final Integer id;
    @NotBlank(message = "Category name is required")
    private final String name;
    public CategoryDto(final Category category) {
        this.id = category.getId();
        this.name = category.getName();
    }
}