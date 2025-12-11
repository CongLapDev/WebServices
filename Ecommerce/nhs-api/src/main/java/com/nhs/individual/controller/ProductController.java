package com.nhs.individual.controller;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhs.individual.domain.Category;
import com.nhs.individual.domain.Product;
import com.nhs.individual.domain.ProductItem;
import com.nhs.individual.exception.ResourceNotFoundException;
import com.nhs.individual.service.CategoryService;
import com.nhs.individual.service.LocalFileStorageService;
import com.nhs.individual.service.ProductItemService;
import com.nhs.individual.service.ProductService;
import com.nhs.individual.specification.DynamicSearch;
import com.nhs.individual.specification.ISpecification.IProductSpecification;
import com.nhs.individual.specification.ProductSpecification;
import com.nhs.individual.workbook.ProductXLSX;
import jakarta.annotation.security.PermitAll;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.multipart.support.StandardMultipartHttpServletRequest;
import lombok.AllArgsConstructor;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/product")
@AllArgsConstructor
public class ProductController {
    private ProductService productService;
    private ProductItemService productItemService;
    private CategoryService categoryService;
    private LocalFileStorageService localFileStorageService;

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

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Product> createProduct(
            @RequestPart("product") String productJson,
            @RequestPart(value = "image", required = false) MultipartFile image,
            HttpServletRequest request) {
        System.out.println("=== CREATE PRODUCT DEBUG START ===");
        
        try {
            // Log multipart request keys
            if (request instanceof StandardMultipartHttpServletRequest multipartRequest) {
                System.out.println("Multipart keys: " + multipartRequest.getMultiFileMap().keySet());
                System.out.println("All multipart parameter names: " + multipartRequest.getParameterMap().keySet());
            } else {
                System.out.println("Request is not StandardMultipartHttpServletRequest, type: " + request.getClass().getName());
            }
            
            // Log productJson raw
            System.out.println("Raw productJson received: " + productJson);
            System.out.println("productJson length: " + (productJson != null ? productJson.length() : 0));
            
            // Log image file information
            if (image == null) {
                System.out.println("No image received from FE!");
            } else {
                System.out.println("Image file received:");
                System.out.println("  - Is empty: " + image.isEmpty());
                System.out.println("  - File size: " + image.getSize() + " bytes");
                System.out.println("  - Content type: " + image.getContentType());
                System.out.println("  - Original filename: " + image.getOriginalFilename());
                System.out.println("  - Name: " + image.getName());
            }
            
            // Check if multipart contains "image" key
            if (request instanceof StandardMultipartHttpServletRequest multipartRequest) {
                if (!multipartRequest.getMultiFileMap().containsKey("image")) {
                    System.out.println("Multipart request does NOT contain key 'image'");
                } else {
                    System.out.println("Multipart request contains key 'image'");
                }
            }
            
            // Configure ObjectMapper for flexible deserialization
            ObjectMapper mapper = new ObjectMapper();
            mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            mapper.configure(DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES, false);
            
            // Parse JSON string to Product object
            System.out.println("Parsing productJson to Product object...");
            Product product = mapper.readValue(productJson, Product.class);
            System.out.println("Product parsed successfully:");
            System.out.println("  - ID: " + product.getId());
            System.out.println("  - Name: " + product.getName());
            System.out.println("  - Category ID: " + (product.getCategory() != null ? product.getCategory().getId() : "null"));
            System.out.println("  - Picture before upload: " + product.getPicture());
            
            // IMPORTANT: Clear picture from JSON (if any) - we'll set it from local file storage
            product.setPicture(null);
            System.out.println("Cleared picture from JSON (set to null)");
            
            // Validate and load category from database
            if (product.getCategory() == null || product.getCategory().getId() == null) {
                throw new IllegalArgumentException("Category id missing from JSON");
            }
            
            System.out.println("Loading category from database, categoryId: " + product.getCategory().getId());
            Category category = categoryService.findById(product.getCategory().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + product.getCategory().getId()));
            product.setCategory(category);
            System.out.println("Category loaded: " + category.getName());
            
            // Upload image to local file storage if present and set picture URL
            if (image != null && !image.isEmpty()) {
                System.out.println("Starting local file upload...");
                System.out.println("  - File size: " + image.getSize() + " bytes");
                System.out.println("  - Content type: " + image.getContentType());
                System.out.println("  - Original filename: " + image.getOriginalFilename());
                
                String imageUrl = localFileStorageService.saveFile(image);
                
                System.out.println("Local file upload completed!");
                System.out.println("Image URL: " + imageUrl);
                
                if (imageUrl == null) {
                    System.err.println("ERROR: Failed to save image to local storage");
                    throw new RuntimeException("Failed to save image to local storage");
                }
                
                // Set picture URL BEFORE saving
                product.setPicture(imageUrl);
                System.out.println("Image uploaded successfully, URL set: " + imageUrl);
            } else {
                System.out.println("No image to upload, picture will remain null");
            }
            
            // Log product state before saving
            System.out.println("Product state BEFORE saving to DB:");
            System.out.println("  - Name: " + product.getName());
            System.out.println("  - Description: " + (product.getDescription() != null ? product.getDescription().substring(0, Math.min(50, product.getDescription().length())) + "..." : "null"));
            System.out.println("  - Manufacturer: " + product.getManufacturer());
            System.out.println("  - Category ID: " + (product.getCategory() != null ? product.getCategory().getId() : "null"));
            System.out.println("  - Picture URL: " + product.getPicture());
            
            // Save product - picture is already set on product object
            System.out.println("Saving product to database...");
            Product savedProduct = productService.create(product);
            System.out.println("Product saved successfully!");
            
            // Log product state after saving
            System.out.println("Product state AFTER saving to DB:");
            System.out.println("  - ID: " + savedProduct.getId());
            System.out.println("  - Name: " + savedProduct.getName());
            System.out.println("  - Picture URL: " + savedProduct.getPicture());
            System.out.println("  - Category ID: " + (savedProduct.getCategory() != null ? savedProduct.getCategory().getId() : "null"));
            
            // Verify picture was saved correctly
            if (image != null && !image.isEmpty() && savedProduct.getPicture() == null) {
                System.err.println("ERROR: Picture was lost after save! Expected: " + product.getPicture());
                throw new RuntimeException("Picture URL was not saved to database");
            }
            
            System.out.println("=== CREATE PRODUCT DEBUG END ===");
            
            // Return with proper CREATED status
            return ResponseEntity.status(HttpStatus.CREATED).body(savedProduct);
        } catch (IOException e) {
            System.err.println("ERROR: Failed to parse product JSON: " + e.getMessage());
            e.printStackTrace();
            System.out.println("=== CREATE PRODUCT DEBUG END (ERROR) ===");
            throw new RuntimeException("Failed to parse product JSON: " + e.getMessage(), e);
        } catch (Exception e) {
            System.err.println("ERROR: Unexpected error: " + e.getMessage());
            e.printStackTrace();
            System.out.println("=== CREATE PRODUCT DEBUG END (ERROR) ===");
            throw e;
        }
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
                                           @RequestPart(name = "picture", required = false) MultipartFile picture,
                                           @RequestPart(name = "productItem") String productItemJson,
                                           HttpServletRequest request) throws IOException {
        System.out.println("=== ADD PRODUCT VARIATION DEBUG START ===");
        System.out.println("Product ID: " + productId);
        System.out.println("Raw productItemJson received: " + productItemJson);
        System.out.println("productItemJson type: " + (productItemJson != null ? productItemJson.getClass().getName() : "null"));
        System.out.println("productItemJson length: " + (productItemJson != null ? productItemJson.length() : 0));
        
        // Log multipart request info
        if (request instanceof StandardMultipartHttpServletRequest multipartRequest) {
            System.out.println("Multipart keys: " + multipartRequest.getMultiFileMap().keySet());
            System.out.println("All multipart parameter names: " + multipartRequest.getParameterMap().keySet());
        }
        
        try {
            // Configure ObjectMapper for flexible deserialization
            ObjectMapper mapper = new ObjectMapper();
            mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            mapper.configure(DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES, false);
            
            // Parse JSON string to ProductItem object
            System.out.println("Parsing productItemJson to ProductItem object...");
            ProductItem item;
            if (productItemJson == null || productItemJson.trim().isEmpty()) {
                throw new IllegalArgumentException("productItem JSON string is null or empty");
            }
            item = mapper.readValue(productItemJson, ProductItem.class);
            System.out.println("ProductItem parsed successfully:");
            System.out.println("  - Price: " + item.getPrice());
            System.out.println("  - Original Price: " + item.getOriginalPrice());
            System.out.println("  - Options count: " + (item.getOptions() != null ? item.getOptions().size() : 0));
            System.out.println("  - Picture before upload: " + item.getPicture());
            
            // Clear picture from JSON (if any) - we'll set it from file upload
            item.setPicture(null);
            
            // Handle picture upload
            if (picture != null && !picture.isEmpty()) {
                System.out.println("Starting local file upload...");
                System.out.println("  - File size: " + picture.getSize() + " bytes");
                System.out.println("  - Content type: " + picture.getContentType());
                System.out.println("  - Original filename: " + picture.getOriginalFilename());
                String imageUrl = localFileStorageService.saveFile(picture);
                System.out.println("Local file upload completed!");
                System.out.println("Image URL: " + imageUrl);
                if (imageUrl != null) {
                    item.setPicture(imageUrl);
                    System.out.println("Image uploaded successfully, URL set: " + imageUrl);
                }
            } else {
                System.out.println("No picture to upload, picture will remain null");
            }
            
            System.out.println("ProductItem state BEFORE saving:");
            System.out.println("  - Price: " + item.getPrice());
            System.out.println("  - Original Price: " + item.getOriginalPrice());
            System.out.println("  - Picture URL: " + item.getPicture());
            System.out.println("  - Options: " + (item.getOptions() != null ? item.getOptions().size() : 0));
            
            ProductItem savedItem = productItemService.create(productId, item);
            System.out.println("ProductItem saved successfully!");
            System.out.println("ProductItem state AFTER saving:");
            System.out.println("  - ID: " + savedItem.getId());
            System.out.println("  - Price: " + savedItem.getPrice());
            System.out.println("  - Picture URL: " + savedItem.getPicture());
            System.out.println("=== ADD PRODUCT VARIATION DEBUG END ===");
            
            return savedItem;
        } catch (IOException e) {
            System.err.println("ERROR: Failed to parse productItem JSON: " + e.getMessage());
            e.printStackTrace();
            System.out.println("=== ADD PRODUCT VARIATION DEBUG END (ERROR) ===");
            throw new RuntimeException("Failed to parse productItem JSON: " + e.getMessage(), e);
        } catch (Exception e) {
            System.err.println("ERROR: Unexpected error: " + e.getMessage());
            e.printStackTrace();
            System.out.println("=== ADD PRODUCT VARIATION DEBUG END (ERROR) ===");
            throw e;
        }
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
