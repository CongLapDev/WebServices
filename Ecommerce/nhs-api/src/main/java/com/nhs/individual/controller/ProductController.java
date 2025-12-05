package com.nhs.individual.controller;

import com.nhs.individual.domain.Product;
import com.nhs.individual.domain.ProductItem;
import com.nhs.individual.exception.ResourceNotFoundException;
import com.nhs.individual.service.CloudinaryService;
import com.nhs.individual.service.ProductItemService;
import com.nhs.individual.service.ProductService;
import com.nhs.individual.specification.DynamicSearch;
import com.nhs.individual.specification.ISpecification.IProductSpecification;
import com.nhs.individual.specification.ProductSpecification;
import com.nhs.individual.workbook.ProductXLSX;
import jakarta.annotation.security.PermitAll;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/api/v1/product")
@AllArgsConstructor
public class ProductController {
    private ProductService productService;
    private ProductItemService productItemService;
    CloudinaryService cloudinaryService;

    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public Product getProductById(@PathVariable(name = "id") Integer id) {
        return productService.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    @RequestMapping( method = RequestMethod.GET)
    @PermitAll
    public Page<Product> getProducts(
            @RequestParam(name = "category", required = false) List<Integer> category,
            @RequestParam(name = "price-max", required = false) BigDecimal priceMax,
            @RequestParam(name = "price-min", required = false) BigDecimal priceMin,
            @RequestParam(name = "page", defaultValue = "0", required = false) Integer page,
            @RequestParam(name = "size", defaultValue = "20", required = false) Integer size,
            @RequestParam(name = "options", required = false) List<Integer> optionsId,
            @RequestParam(name = "name", required = false) String name,
            @RequestParam(name="orderBy",required=false) List<String> orderBy,
            @RequestParam(name="order",required=false,defaultValue = "ASC") Sort.Direction order,
            @RequestParam Map<String,String> request) {
            List<Specification<Product>> specifications = new ArrayList<>();
        if (category != null) specifications.add(IProductSpecification.inCategory(category));
        if (priceMin != null && priceMax != null)
            specifications.add(IProductSpecification.priceLimit(priceMin, priceMax));
        if (optionsId != null) specifications.add(IProductSpecification.hasOption(optionsId));
        if(name!=null) specifications.add(IProductSpecification.hasName(name));
        PageRequest pageRequest=PageRequest.of(page,size);
        Sort sort;
        if(orderBy!=null&&!orderBy.isEmpty()) {
            String[] orders = orderBy.toArray(new String[orderBy.size()]);
            sort= Sort.by(orders);
            if(order==Sort.Direction.ASC) sort=sort.ascending();
            else if(order==Sort.Direction.DESC) sort=sort.descending();
            pageRequest=pageRequest.withSort(sort);
        }
        return productService.findAll(specifications,pageRequest);
    }

    @RequestMapping(value = "/xlsx",method = RequestMethod.GET)
    public void exportXlSX(
            @RequestParam(name = "category", required = false) List<Integer> category,
            @RequestParam(name = "priceMax", required = false) BigDecimal priceMax,
            @RequestParam(name = "priceMin", required = false) BigDecimal priceMin,
            @RequestParam(name = "page", defaultValue = "0", required = false) Integer page,
            @RequestParam(name = "size", defaultValue = "20", required = false) Integer size,
            @RequestParam(name = "options", required = false) List<Integer> optionsId,
            @RequestParam(name = "name", required = false) String name,
            HttpServletRequest request,
            HttpServletResponse response) throws IOException {
        List<Specification<Product>> specifications = new ArrayList<>();
        Map<String,String[]> params = request.getParameterMap();
        if (category != null) specifications.add(IProductSpecification.inCategory(category));
        if (priceMin != null && priceMax != null)
            specifications.add(IProductSpecification.priceLimit(priceMin, priceMax));
        if (optionsId != null) specifications.add(IProductSpecification.hasOption(optionsId));
        if(name!=null) specifications.add(IProductSpecification.hasName(name));
        List<Product> product=productService.findAll(specifications,PageRequest.of(page,size)).getContent();
        response.setContentType("application/octet-stream");
        DateFormat dateFormatter = new SimpleDateFormat("yyyy-MM-dd_HH:mm:ss");
        String currentDateTime = dateFormatter.format(new Date());
        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=products" + currentDateTime + ".xlsx";
        response.setHeader(headerKey, headerValue);
        try(Workbook workbook = ProductXLSX.from(product)){
            workbook.write(response.getOutputStream());
        }

    }

    @RequestMapping(value = "/custom", method = RequestMethod.GET)
    public List<Product> getProductCustom(HttpServletRequest request,
                                          @RequestParam(name = "page", defaultValue = "0") Integer page,
                                          @RequestParam(name = "size", defaultValue = "20") Integer size) {
        ArrayList<ProductSpecification> list = new ArrayList<>();
        request.getParameterMap()
                .forEach((key, value) -> {
                    String[] extract = value[0].split("[()]");
                    if (extract.length == 2) {
                        list.add(new ProductSpecification(new DynamicSearch(key, extract[1], DynamicSearch.Operator.valueOf(extract[0]))));
                    }
                });
        Pageable pageable = PageRequest.of(page, size);
        return productService.custom(list, pageable);
    }

    @RequestMapping(method = RequestMethod.POST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ADMIN')")
    public Product createProduct(
            @RequestPart(value = "image", required = false) MultipartFile image,
            Product product) {
        if (image != null) {
            product.setPicture((String) cloudinaryService.upload(image).get("url"));
        }
        return productService.create(product);
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.PUT)
    @PreAuthorize("hasAuthority('ADMIN')")
    public Product updateProduct(@PathVariable(name = "id") Integer id,
                                 @RequestBody Product product) {
        return productService.update(id, product);
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    @PreAuthorize("hasAuthority('ADMIN')")
    public void deleteProduct(@PathVariable(name = "id") Integer id) {
        productService.delete(id);
    }


    //Product item
    @RequestMapping(value = "/{product_id}/item", method = RequestMethod.GET)
    public Collection<ProductItem> getAllByProduct(@PathVariable(name = "product_id") Integer productId) {
        return productItemService.findAllByProductId(productId);
    }

    @RequestMapping(value = "/{product_id}/item/{item_id}", method = RequestMethod.GET)
    public ProductItem getProductItem(@PathVariable(name = "product_id") Integer productId,
                                      @PathVariable(name = "item_id") Integer itemId) {
        return productItemService.findById(itemId).orElseThrow(() -> new ResourceNotFoundException("product item not found"));
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @RequestMapping(value = "/{product_id}/items", method = RequestMethod.POST)
    public Product createAllByProduct(@PathVariable(name = "product_id") Integer productId,
                                      @RequestBody List<ProductItem> productItem) {
        return productItemService.saveAll(productId, productItem);
    }

    @RequestMapping(value = "/{product_id}/item", method = RequestMethod.POST, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProductItem addProductVariation(@PathVariable(name = "product_id") Integer productId,
                                           @RequestPart(name = "image", required = false) MultipartFile image,
                                           @RequestPart(name = "productItem") ProductItem item) {
        if (image != null && !image.isEmpty()) {
            item.setPicture((String) cloudinaryService.upload(image).get("url"));
        }
        System.out.println(item);
        return productItemService.create(productId, item);
    }

    @RequestMapping(value = "/item/{item_id}", method = RequestMethod.PUT)
    @PreAuthorize("hasAuthority('ADMIN')")
    public ProductItem updateProductItem(@PathVariable(name = "product_id", required = false) Integer productId,
                                         @PathVariable(name = "item_id") Integer itemId,
                                         @RequestBody ProductItem productItem) {
        return productItemService.update(itemId, productItem);
    }

    @RequestMapping(value = "/{product_id}/item/{item_id}", method = RequestMethod.DELETE)
    @PreAuthorize("hasAuthority('ADMIN')")
    public void deleteProductItemById(@PathVariable(name = "product_id", required = false) Integer productId,
                                      @PathVariable(name = "item_id") Integer itemId) {
        productItemService.deleteById(itemId);
    }

    @RequestMapping(value = "/warehouse/{warehouseId}", method = RequestMethod.GET)
    public Collection<Product> getAllByWarehouse(@PathVariable(name = "warehouseId") Integer warehouseId) {
        return productService.findAllByWarehouseId(warehouseId);
    }
}
