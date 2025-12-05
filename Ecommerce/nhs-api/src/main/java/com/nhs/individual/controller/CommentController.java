package com.nhs.individual.controller;

import com.nhs.individual.domain.Comment;
import com.nhs.individual.service.CommentService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/api/v1/comment")
@AllArgsConstructor
public class CommentController {
    private CommentService commentService;
    @RequestMapping(method = RequestMethod.GET)
    public List<Comment> getCommentsByProductId(@RequestParam(name = "product") Integer productId,
                                                @RequestParam(name = "page",required = false,defaultValue = "0") int page,
                                                @RequestParam(name = "size",required = false,defaultValue = "20") int size) {
        return  commentService.findAllByProductId(productId, PageRequest.of(page,size));
    }

    @RequestMapping(method = RequestMethod.POST)
    @PreAuthorize("#comment.user.id==authentication.principal.userId")
    public Comment addComment(@RequestBody Comment comment) {
        return commentService.save(comment);
    }
    @RequestMapping(value = "/{id}",method = RequestMethod.DELETE)
    public void deleteComment(@PathVariable Integer id) {
        commentService.deleteById(id);
    }

}
