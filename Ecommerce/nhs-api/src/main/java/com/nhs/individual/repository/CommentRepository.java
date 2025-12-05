package com.nhs.individual.repository;

import com.nhs.individual.domain.Comment;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Integer> {
    @Query(value = "select * from ecommerce.comment where product_id=?1",nativeQuery = true)
    List<Comment> findAllByProductId(int productId, Pageable pageable);

}
