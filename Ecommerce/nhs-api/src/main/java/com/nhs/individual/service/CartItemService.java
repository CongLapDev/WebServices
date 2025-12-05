package com.nhs.individual.service;

import com.nhs.individual.domain.CartItem;
import com.nhs.individual.domain.User;
import com.nhs.individual.exception.ResourceNotFoundException;
import com.nhs.individual.repository.CartItemRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CartItemService {
    @Autowired
    private CartItemRepository cartItemRepository;
    @Autowired
    private ProductItemService productItemService;
    @Autowired
    AuthService authService;

    public Page<CartItem> findAllByUserId(Integer userId, PageRequest page) {
        return cartItemRepository.findAllByUser_idOrderByIdDesc(userId, page);
    }

    @Transactional
    public CartItem save(CartItem cartItem) {
        User user = authService.getCurrentUser();
        cartItem.setUser(user);
        return cartItemRepository.findByUser_idAndProduct_item_id(user.getId(), cartItem.getProductItem().getId())
                .map(cartItem1 -> {
                    cartItemRepository.updateQty(cartItem1.getId(), cartItem1.getQty() + cartItem.getQty());
                    cartItem1.setQty(cartItem.getQty() + cartItem1.getQty());
                    return cartItem1;
                }).orElseGet(() -> cartItemRepository.save(cartItem));
    }

    @Transactional
    public CartItem update(Integer id, CartItem cartItem) {
        return cartItemRepository.findById(id).map(item -> {
            if (cartItem.getQty() != null) {
                item.setQty(cartItem.getQty());
            }
            if (cartItem.getProductItem() != null && cartItem.getProductItem().getId() != null) {
                productItemService.findById(cartItem.getProductItem().getId()).ifPresent(productItem -> {
                    item.setProductItem(productItem);
                });
            }
            cartItemRepository.update(item.getId(), item.getQty(), item.getProductItem().getId());
            return item;
        }).orElseThrow(() -> new ResourceNotFoundException("Could not find cart item with id " + cartItem.getId()));
    }

    public Optional<CartItem> findById(Integer id) {
        return cartItemRepository.findById(id);
    }

    public void deleteById(Integer id) {
        cartItemRepository.deleteById(id);
    }
}
