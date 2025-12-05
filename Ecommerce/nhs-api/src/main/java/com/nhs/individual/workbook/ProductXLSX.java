package com.nhs.individual.workbook;

import com.nhs.individual.domain.Product;
import com.nhs.individual.domain.ProductItem;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.util.List;

public class ProductXLSX {
    public static XSSFWorkbook from(List<Product> products) {
        XSSFWorkbook xssfWorkbook = new XSSFWorkbook();
        XSSFSheet sheet = xssfWorkbook.createSheet("Default");
        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("ID");
        header.createCell(1).setCellValue("PD_NAME");
        header.createCell(2).setCellValue("PD_PICTURE");
        header.createCell(3).setCellValue("PD_DESCRIPTION");
        header.createCell(4).setCellValue("PD_MANUFACTURER");
        header.createCell(5).setCellValue("PD_ITEM_ID");
        header.createCell(6).setCellValue("PICTURE");
        header.createCell(7).setCellValue("OPTION");
        header.createCell(8).setCellValue("AVAILABLE");
        int startOrder = 1;
        int endOrder;
        for (int i = 0; i < products.size(); i++) {
            endOrder = products.get(i).getProductItems().size() + startOrder - 1;
            Row row = sheet.createRow(startOrder);
            row.createCell(0).setCellValue(products.get(i).getId());
            row.createCell(1).setCellValue(products.get(i).getName());
            row.createCell(2).setCellValue(products.get(i).getPicture());
            row.createCell(3).setCellValue(products.get(i).getDescription());
            row.createCell(4).setCellValue(products.get(i).getManufacturer());
            for (int z = 0; z < products.get(i).getProductItems().size(); z++) {
                ProductItem productItem=products.get(i).getProductItems().get(z);
                Row ref=row;
                if(z!=0){
                    ref=sheet.createRow(startOrder + z);
                }
                ref.createCell(5).setCellValue(productItem.getId());
                ref.createCell(6).setCellValue(productItem.getPicture());
                ref.createCell(7).setCellValue(String.join(",", productItem.getOptions().stream().map(option->option.getVariation().getName()+":"+option.getValue()).toList()));
                ref.createCell(8).setCellValue(productItem.getWarehouses().stream().reduce(0,(pre,item)->pre+item.getQty(),Integer::sum));
            }
            if (endOrder - startOrder > 0) {
                for (int j = 0; j < 5; j++) {
                    sheet.addMergedRegion(new CellRangeAddress(startOrder, endOrder, j, j));
                }
            }
            startOrder = endOrder + 1;
        }
        return xssfWorkbook;
    }

}
