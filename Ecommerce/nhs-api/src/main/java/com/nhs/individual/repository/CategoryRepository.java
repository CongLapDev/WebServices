package com.nhs.individual.repository;

import com.nhs.individual.domain.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;

@Repository
public interface CategoryRepository extends JpaRepository<Category,Integer> {
    Collection<Category> findAllByParentId(Integer id);
    @Modifying
    @Transactional
    @Query(value = "delete from category where parent_category_id= ?1",nativeQuery = true)
    void deleteAllByParentId(Integer parentId);
}
