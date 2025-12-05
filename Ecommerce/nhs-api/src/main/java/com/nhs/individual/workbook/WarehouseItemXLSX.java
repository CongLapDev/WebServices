package com.nhs.individual.workbook;

import com.nhs.individual.domain.EmbeddedId.ProductItemInWarehouseId;
import com.nhs.individual.domain.ProductItem;
import com.nhs.individual.domain.Warehouse;
import com.nhs.individual.domain.WarehouseItem;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class WarehouseItemXLSX {
    public static List<WarehouseItem> read(InputStream inputStream) throws IOException {
        XSSFWorkbook workbook=new XSSFWorkbook(inputStream);
        XSSFSheet sheet=workbook.getSheetAt(0);
        Iterator<Row> rows=sheet.iterator();
        List<WarehouseItem> warehouseItems=new ArrayList<WarehouseItem>();
        while(rows.hasNext()) {
            Row row=rows.next();
            if(row.getRowNum()==0) continue;
            WarehouseItem warehouseItem=new WarehouseItem();
            Integer productItemid=(int) row.getCell(1).getNumericCellValue();
            Integer warehouseId=(int) row.getCell(0).getNumericCellValue();
            warehouseItem.setId(new ProductItemInWarehouseId(productItemid, warehouseId));
            ProductItem pd=new ProductItem();
            Warehouse warehouse=new Warehouse();
            pd.setId(productItemid);
            warehouse.setId(warehouseId);
            warehouseItem.setWarehouse(warehouse);
            warehouseItem.setProductItem(pd);
            warehouseItem.setQty((int) row.getCell(2).getNumericCellValue());
            warehouseItems.add(warehouseItem);
        }
        return warehouseItems;
    }
}
