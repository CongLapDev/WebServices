package com.nhs.individual.service;

import com.nhs.individual.domain.Product;
import com.nhs.individual.domain.ProductItem;
import com.nhs.individual.exception.ResourceNotFoundException;
import com.nhs.individual.repository.CartItemRepository;
import com.nhs.individual.repository.OrderLineRepository;
import com.nhs.individual.repository.ProductItemRepository;
import com.nhs.individual.repository.WarehouseItemRepository;
import com.nhs.individual.utils.ObjectUtils;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class ProductItemService {
    @Autowired
    ProductItemRepository productItemRepository;
    @Autowired
    ProductService productService;
    @Autowired
    CategoryService categoryService;
    @Autowired
    VariationService variationService;
    @Autowired
    OrderLineRepository orderLineRepository;
    @Autowired
    CartItemRepository cartItemRepository;
    @Autowired
    WarehouseItemRepository warehouseItemRepository;
    public ProductItem create(Integer productId, ProductItem productItem){
        return productService.findById(productId).map(product -> {
            productItem.setProduct(product);
            return productItemRepository.save(productItem);
        }).orElseThrow(()->new ResourceNotFoundException("product with id"+productId+" not found"));
    }
    public Product saveAll(Integer productId, List<ProductItem> productItems){
        return productService.findById(productId).map(product -> {
            product.setProductItems(productItems);
            productItems.forEach(productItem ->{
                productItem.setProduct(product);
                productItemRepository.save(productItem);
            });
            return product;
        }).orElseThrow(()->new ResourceNotFoundException("product with id"+productId+" not found"));
    }
    public Optional<ProductItem> findById(int id){
        return productItemRepository.findById(id);
    }
    public Collection<ProductItem> findAllByProductId(Integer productId){
        return productService.findById(productId).map(Product::getProductItems).orElse(Collections.emptyList());
    }
    @Transactional
    public void deleteById(int id){
        // Check if product item exists
        if (!productItemRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product item with id " + id + " not found");
        }
        
        // Check if product item has any order lines (cannot delete items that have been ordered)
        boolean hasOrderLines = orderLineRepository.existsByProductItemId(id);
        if (hasOrderLines) {
            throw new IllegalStateException(
                "Cannot delete product variation because it has been ordered. " +
                "Product items with existing orders cannot be deleted.");
        }
        
        // Delete cart items that reference this product item
        cartItemRepository.deleteByProductItemId(id);
        
        // Delete warehouse items that reference this product item
        warehouseItemRepository.deleteByProductItemId(id);
        
        // Now safe to delete the product item
        productItemRepository.deleteById(id);
    }
    public ProductItem update(Integer id,ProductItem productItem){
        return productItemRepository.save(findById(id).map(oldProductItem-> ObjectUtils.merge(oldProductItem,productItem, ProductItem.class)).orElseThrow(()->new ResourceNotFoundException("Product item with id " + id+" not found")));
    }

}
