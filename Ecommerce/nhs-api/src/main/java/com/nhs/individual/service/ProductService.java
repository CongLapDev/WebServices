package com.nhs.individual.service;

import com.nhs.individual.domain.Product;
import com.nhs.individual.exception.ResourceNotFoundException;
import com.nhs.individual.repository.ProductRepository;
import com.nhs.individual.specification.ProductSpecification;
import com.nhs.individual.utils.ObjectUtils;
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
        return productRepository.findById(id).map(oldProduct-> ObjectUtils.merge(oldProduct,product,Product.class)).orElseThrow(()->new RuntimeException("Product not found"));
    }
    public void delete(Integer id){
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