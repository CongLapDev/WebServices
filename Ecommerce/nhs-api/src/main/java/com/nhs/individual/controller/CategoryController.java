package com.nhs.individual.controller;

import com.nhs.individual.domain.Category;
import com.nhs.individual.domain.Product;
import com.nhs.individual.exception.ResourceNotFoundException;
import com.nhs.individual.service.CategoryService;
import com.nhs.individual.service.ProductService;
import com.nhs.individual.service.VariationOptionService;
import lombok.AllArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.List;

@RestController
@RequestMapping("/api/v1/category")
@AllArgsConstructor
public class CategoryController {
    CategoryService categoryService;
    VariationOptionService variationOptionService;
    ProductService productService;
    @RequestMapping(method = RequestMethod.GET)
    public Collection<Category> findAll(){
        return categoryService.findAll();
    }
//    @RequestMapping(value ="/{parent_id}",method = RequestMethod.GET)
//    public Collection<Category> findAllByParentId(@PathVariable(name = "parent_id") Integer id){
//        return categoryService.findAllByParentId(id);
//    }
    @RequestMapping(value = "/{category_id}",method = RequestMethod.GET)
    public Category findById(@PathVariable(name = "category_id") Integer id){
        return categoryService.findById(id).orElseThrow(()->  new ResourceNotFoundException("Could not find category with id: "+id));
    }
    @RequestMapping(method = RequestMethod.POST)
    @PreAuthorize("hasAuthority('ADMIN')")
    public Category create(@RequestBody Category category){
        return categoryService.create(category);
    }
    @RequestMapping(value = "/{parent_id}",method = RequestMethod.POST)
    public List<Category> createChild(@RequestBody List<Category> category,
                                @PathVariable(name = "parent_id") Integer id){
        return categoryService.addChild(id,category);
    }

    @RequestMapping(value = "/{category_id}",method = RequestMethod.PUT)
    @PreAuthorize("hasAuthority('ADMIN')")
    public Category updateById(@RequestBody Category category,
            @PathVariable(name = "category_id") Integer id){
        return categoryService.updateCategory(id,category);
    }
    @RequestMapping(value = "/{category_id}",method = RequestMethod.DELETE)
    @PreAuthorize("hasAuthority('ADMIN')")
    public void deleteById(@PathVariable(name = "category_id") Integer id){
        categoryService.deleteById(id);
    }
    @RequestMapping(value = "/{category_id}/empty",method = RequestMethod.DELETE)
    public void deleteByParentId(@PathVariable(name = "category_id") Integer id){
        categoryService.deleteAllByParentId(id);
    }

    //Category-products
    @RequestMapping(value = "/{category_id}/product", method = RequestMethod.GET)
    public Collection<Product> getProductByCategory(@PathVariable(name = "category_id") Integer id) {
        return productService.findAllByCategoryId(id);
    }
    @RequestMapping(value="/{category_id}/product",method = RequestMethod.POST)
    @PreAuthorize("hasAuthority('ADMIN')")
    public Product createProductInCategory(@PathVariable(name = "category_id") Integer categoryId,
                                           @RequestBody Product product){
        Category category=new Category();
        category.setId(categoryId);
        product.setCategory(category);
        return productService.create(product);
    }




}
