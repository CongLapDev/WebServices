package com.nhs.individual.service;

import com.nhs.individual.domain.Comment;
import com.nhs.individual.repository.CommentRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class CommentService {
    private CommentRepository commentRepository;
    public Comment save(Comment comment) {
        return commentRepository.save(comment);
    }
    public List<Comment> findAllByProductId(int productId, Pageable pageable) {
        return commentRepository.findAllByProductId(productId,pageable);
    }
    public void deleteById(int commentId){
        commentRepository.deleteById(commentId);
    }

}
