package com.nhs.individual.controller;

import com.nhs.individual.domain.CartItem;
import com.nhs.individual.service.AuthService;
import com.nhs.individual.service.CartItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/api/v1/cart")
public class CartController {
    @Autowired
    CartItemService cartItemService;
    @Autowired
    AuthService authService;

    @RequestMapping( method = RequestMethod.GET)
    @PreAuthorize("#userId==authentication.principal.userId or hasAuthority('ADMIN')")
    public Page<CartItem> getUserCarts(
            @RequestParam(name = "size",required = false,defaultValue = "0") Integer page,
            @RequestParam(name = "size",required = false,defaultValue = "10") Integer size,
            @RequestParam Integer userId){
        return cartItemService.findAllByUserId(userId, PageRequest.of(page,size));
    }
    @PreAuthorize("#cart.user.id==authentication.principal.userId or hasAuthority('ADMIN')")
    @RequestMapping(method = RequestMethod.POST)
    public CartItem create(@RequestBody CartItem cart){
        return cartItemService.save(cart);
    }
    @RequestMapping(value = "/{id}", method = RequestMethod.PUT)
    public CartItem updateById(@PathVariable Integer id, @RequestBody CartItem cart){
        cart.setId(id);
        return cartItemService.update(id,cart);
    }
    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public Integer deleteById(@PathVariable Integer id){
        cartItemService.deleteById(id);
        return id;
    }
}
