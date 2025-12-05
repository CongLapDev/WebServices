package com.nhs.individual.controller;

import com.nhs.individual.domain.Product;
import com.nhs.individual.domain.Warehouse;
import com.nhs.individual.domain.WarehouseItem;
import com.nhs.individual.exception.ResourceNotFoundException;
import com.nhs.individual.service.ProductService;
import com.nhs.individual.service.WareHouseItemService;
import com.nhs.individual.service.WareHouseService;
import com.nhs.individual.workbook.WarehouseItemXLSX;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collection;
@PreAuthorize("hasAuthority('ADMIN')")
@RestController
@RequestMapping("/api/v1/warehouse")
public class WarehouseController {
    @Autowired
    WareHouseService wareHouseService;
    @Autowired
    ProductService productService;
    @Autowired
    WareHouseItemService wareHouseItemService;
    @RequestMapping(method = RequestMethod.GET)
    public Collection<Warehouse> findAll(){
        return wareHouseService.findAll();
    }
    @RequestMapping(value = "/{warehouse_id}",method = RequestMethod.GET)
    public Warehouse findById(@PathVariable(name = "warehouse_id") Integer id){
        return wareHouseService.findById(id).orElseThrow(()->new ResourceNotFoundException("Warehouse not found"));
    }
    @RequestMapping(method = RequestMethod.POST)
    public Warehouse create(@RequestBody  Warehouse wareHouse){
        return wareHouseService.create(wareHouse);
    }
    @RequestMapping(value = "/{warehouse_id}",method = RequestMethod.PUT)
    public Warehouse update(@PathVariable(name = "warehouse_id") Integer id, Warehouse wareHouse){
        return wareHouseService.update(id,wareHouse);
    }
    @PreAuthorize("hasAuthority('ADMIN')")
    @RequestMapping(value = "/{warehouse_id}",method = RequestMethod.DELETE)
    public void deleteById(@PathVariable(name = "warehouse_id") Integer id){
        wareHouseService.deleteById(id);
    }
    //Product accessories
    @RequestMapping(value="/{warehouse_id}/product",method = RequestMethod.GET)
    public Collection<Product> findAllProduct(@PathVariable(name = "warehouse_id") Integer id){
        return productService.findAllByWarehouseId(id);
    }
    @PreAuthorize("hasAuthority('ADMIN')")
    @RequestMapping(value = "/{warehouse_id}/importXLSX",method = RequestMethod.POST,consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Collection<WarehouseItem> importGoods(@RequestPart(name = "file") MultipartFile file) throws IOException {
        return wareHouseItemService.importGoods(WarehouseItemXLSX.read(file.getInputStream()));
    }
    @RequestMapping(value = "/importXLSX/sample")
    public void downloadSampleImportXlsx(HttpServletResponse response) throws IOException {
        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=sample.xlsx";
        response.setHeader(headerKey, headerValue);
        try (InputStream fileInputStream = this.getClass().getResourceAsStream("/warehouseImportSample.xlsx")) {
            assert fileInputStream != null;
            fileInputStream.transferTo(response.getOutputStream());
        }
    }
    //Product Item In warehouse
    @RequestMapping(value ="/{warehouse_id}/item/{id}",method = RequestMethod.GET)
    public WarehouseItem findItemByWarehouseId(@PathVariable(name = "warehouse_id")Integer warehouseId,
                                                           @PathVariable(name = "id") Integer id){
        return wareHouseItemService.findByItemIdAndWarehouseId(id,warehouseId).orElseThrow(
                ()->new ResourceNotFoundException("Warehouse item not found")
        );
    }
    @PreAuthorize("hasAuthority('ADMIN')")
    @RequestMapping(value = "/{warehouseId}/item/{id}", method = RequestMethod.POST)
    public WarehouseItem createItem(@PathVariable(name = "warehouseId") Integer warehouseId,
                                    @PathVariable(name = "id") Integer id,
                                    @RequestBody WarehouseItem warehouseItem){
        return wareHouseItemService.importNewItem(warehouseId,id,warehouseItem);
    }
    @PreAuthorize("hasAuthority('ADMIN')")
    @RequestMapping(value = "/{warehouseId}/item/{id}", method = RequestMethod.PUT)
    public void updateItem(@PathVariable(name = "warehouseId") Integer warehouseId,
                                    @PathVariable(name = "id") Integer id,
                                    @RequestBody WarehouseItem warehouseItem){
        wareHouseItemService.update(warehouseId, id,warehouseItem);
    }
    @PreAuthorize("hasAuthority('ADMIN')")
    @RequestMapping(value = "/{warehouseId}/item/{id}",method = RequestMethod.DELETE)
    public void deleteItem(@PathVariable(name = "warehouseId") Integer warehouseId,
                                    @PathVariable(name = "id") Integer id){
        wareHouseItemService.deleteItemFromWarehouse(id,warehouseId);
    }



}
