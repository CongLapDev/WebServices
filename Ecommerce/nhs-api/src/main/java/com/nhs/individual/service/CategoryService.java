package com.nhs.individual.service;

import com.nhs.individual.domain.Category;
import com.nhs.individual.exception.DuplicateElementException;
import com.nhs.individual.exception.ResourceNotFoundException;
import com.nhs.individual.repository.CategoryRepository;
import com.nhs.individual.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;
    public Category create(Category category){
        validateCategory(category);
        return categoryRepository.save(category);
    }
    public List<Category> addChild(int parentId, List<Category> categories){
        Category parent = new Category();
        parent.setId(parentId);
        categories.forEach(caregory->{
            caregory.setParent(parent);
           validateCategory(caregory);
        });
        return categoryRepository.saveAll(categories);
    }
    public Optional<Category> findById(int id){
        return categoryRepository.findById(id);
    }
    public Collection<Category> findAllByParentId(int parentId){
        return categoryRepository.findAllByParentId(parentId);
    }

    public Category updateCategory(int id,Category category){
        return findById(id).map(oldCategory->{
            category.setId(oldCategory.getId());
            return categoryRepository.save(ObjectUtils.merge(oldCategory,category,Category.class));
        }).orElseThrow(()->new ResourceNotFoundException("Couldn't find category with id " + id));
    }
    public Collection<Category> findAll(){
        return categoryRepository.findAll();
    }
    public void deleteById(Integer id){
        categoryRepository.deleteById(id);
    }

    public void deleteAllByParentId(Integer parentId){
        categoryRepository.deleteAllByParentId(parentId);
    }
    public void validateCategory(Category category){
        if(Optional.ofNullable(category.getParent()).isPresent()){
            categoryRepository.findById(category.getParent().getId()).map(parent->{
                if (parent.getChildren().stream().anyMatch(sib->sib.getName().equals(category.getName()))) {
                    throw new DuplicateElementException("The category's name can not be the same as its siblings : "+String.valueOf(parent.getId()));
                }
                return category;
            }).orElseThrow(()->new IllegalArgumentException("Parent category does not exist. Parent id: "+category.getParent().getId()));
        }else{
            throw new IllegalArgumentException("Missing parent category information (parent category id)");
        }
        if(category.getChildren()!=null){
            for(int i=0;i<category.getChildren().size();i++){
                for(int j=i+1;j<category.getChildren().size();j++){
                    if(category.getChildren().get(i).getName().equals(category.getChildren().get(j).getName())){
                        throw new DuplicateElementException("The category's name can not be the same as its siblings" + category.getChildren().get(j).getName());
                    }
                }
                category.getChildren().get(i).setParent(category);
            }
        }
    }
}
