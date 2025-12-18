package com.nhs.individual.service;

import com.nhs.individual.domain.Product;
import com.nhs.individual.exception.ResourceNotFoundException;
import com.nhs.individual.repository.CartItemRepository;
import com.nhs.individual.repository.OrderLineRepository;
import com.nhs.individual.repository.ProductRepository;
import com.nhs.individual.repository.WarehouseItemRepository;
import com.nhs.individual.specification.ProductSpecification;
import com.nhs.individual.utils.ObjectUtils;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {
    @Autowired
    ProductRepository productRepository;
    @Autowired
    CategoryService categoryService;
    @Autowired
    OrderLineRepository orderLineRepository;
    @Autowired
    CartItemRepository cartItemRepository;
    @Autowired
    WarehouseItemRepository warehouseItemRepository;

    public Product save(Product product){
        return productRepository.save(product);
    }
    public Product create(Product product){
        if(product.getCategory()==null) throw new IllegalArgumentException("Product must be dependent on a category");
        Integer categoryId = product.getCategory().getId();
        return categoryService.findById(categoryId).map(category->{
            product.setCategory(category);
            if(product.getProductItems()!=null){
                product.getProductItems().forEach((productItem -> productItem.setProduct(product)));
            }
            return productRepository.save(product);
        }).orElseThrow(()->new ResourceNotFoundException("Category with id " + categoryId+" not found"));
    }
    public Collection<Product> findAll(Pageable pageable){
        Page<Product> products=productRepository.findAll(pageable);
        return products.getContent();
    }
    public Page<Product> findAll(List<Specification<Product>> specs,Pageable pageable){
        if(specs.isEmpty()) return productRepository.findAll(pageable);
        else{
            Specification<Product> spec = specs.get(0);
            for(int i=1;i<specs.size();i++){
                spec = spec.and(specs.get(i));
            }
            return productRepository.findAll(spec,pageable);
        }
    }
    public Optional<Product> findById(Integer id){
        return productRepository.findById(id);
    }
    public Collection<Product> findAllByCategoryId(Integer categoryId){
        return productRepository.findAllByCategory_id(categoryId);
    }
    public Collection<Product> findAllByWarehouseId(Integer warehouseId){
        return productRepository.findAllByWarehouseId(warehouseId);
    }
    public Product update(Integer id,Product product){
        return productRepository.findById(id).map(oldProduct-> {
            // Store the picture value from the update request before merge
            // (since ObjectUtils.merge skips null values, we need to handle picture deletion explicitly)
            String requestedPicture = product.getPicture();
            
            // Merge new data into old product
            Product merged = ObjectUtils.merge(oldProduct, product, Product.class);
            
            // Handle picture explicitly:
            // - If requestedPicture is null and old product had a picture, delete it (set to null)
            // - If requestedPicture is not null, use it (already merged by ObjectUtils.merge)
            // - If both are null, keep it null (already null)
            if (requestedPicture == null && oldProduct.getPicture() != null) {
                // Picture is being explicitly removed - set to null
                merged.setPicture(null);
            } else if (requestedPicture != null) {
                // New picture provided - ensure it's set (should already be merged, but set explicitly to be sure)
                merged.setPicture(requestedPicture);
            }
            // If both requestedPicture and oldProduct.picture are null, merged.picture is already null
            
            // Ensure category is properly set if provided
            if (product.getCategory() != null && product.getCategory().getId() != null) {
                Integer categoryId = product.getCategory().getId();
                categoryService.findById(categoryId).ifPresent(merged::setCategory);
            }
            // Save and return updated product
            return productRepository.save(merged);
        }).orElseThrow(()->new RuntimeException("Product not found"));
    }
    @Transactional
    public void delete(Integer id){
        // Find the product first
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product with id " + id + " not found"));
        
        // Check if product has any order lines (cannot delete products that have been ordered)
        boolean hasOrderLines = orderLineRepository.existsByProductId(id);
        if (hasOrderLines) {
            throw new IllegalStateException(
                "Cannot delete product '" + product.getName() + 
                "' because it has been ordered. Products with existing orders cannot be deleted.");
        }
        
        // Delete cart items that reference this product's items
        cartItemRepository.deleteByProductId(id);
        
        // Delete warehouse items that reference this product's items
        warehouseItemRepository.deleteByProductId(id);
        
        // Now safe to delete the product (cascade will delete product items)
        productRepository.deleteById(id);
    }

    public List<Product> custom(List<ProductSpecification> specifications, Pageable pageable){
        if(!specifications.isEmpty()){
            Specification<Product> predicates=Specification.where(specifications.get(0));
            for(int i=1;i<specifications.size();i++){
               predicates.or(specifications.get(i));
            }
            return productRepository.findAll(predicates,pageable).getContent();
        }
        return List.of();
    }

}