package com.nhs.individual.workbook;

import com.nhs.individual.constant.OrderStatus;
import com.nhs.individual.domain.OrderLine;
import com.nhs.individual.domain.ShopOrder;
import com.nhs.individual.domain.ShopOrderStatus;
import com.nhs.individual.domain.VariationOption;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.util.List;

public class ShopOrdersXLSX {
    public static XSSFWorkbook from(List<ShopOrder> orders) {
        XSSFWorkbook xssfWorkbook = new XSSFWorkbook();
        XSSFSheet sheet = xssfWorkbook.createSheet("Default");
        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("ID");
        header.createCell(1).setCellValue("DATE");
        header.createCell(2).setCellValue("USER ID");
        header.createCell(3).setCellValue("USER LASTNAME");
        header.createCell(4).setCellValue("USER FIRSTNAME");
        header.createCell(5).setCellValue("USER PHONE");
        header.createCell(6).setCellValue("USER EMAIL");
        header.createCell(7).setCellValue("CITY");
        header.createCell(8).setCellValue("ADDRESS LINE 1");
        header.createCell(9).setCellValue("ADDRESS LINE 2");
        header.createCell(10).setCellValue("POSTAL CODE");
        header.createCell(11).setCellValue("REGION");
        header.createCell(12).setCellValue("DELIVERY METHOD");
        header.createCell(13).setCellValue("STATUS");
        header.createCell(14).setCellValue("PAYMENT");
        header.createCell(15).setCellValue("ITEMS");
        header.createCell(16).setCellValue("PRODUCT NAME");
        header.createCell(17).setCellValue("SPECS");
        header.createCell(18).setCellValue("QTY");
        header.createCell(18).setCellValue("LINE TOTAL");
        header.createCell(20).setCellValue("TOTAL");
        int startOrder = 1;
        int endOrder;
        for (int i = 0; i < orders.size(); i++) {
            endOrder = orders.get(i).getOrderLines().size() + startOrder - 1;
            Row row = sheet.createRow(startOrder);
            row.createCell(0).setCellValue(orders.get(i).getId());
            row.createCell(1).setCellValue(orders.get(i).getOrderDate());
            row.createCell(2).setCellValue(orders.get(i).getUserId());
            row.createCell(3).setCellValue(orders.get(i).getUser().getLastname());
            row.createCell(4).setCellValue(orders.get(i).getUser().getFirstname());
            row.createCell(5).setCellValue(orders.get(i).getUser().getPhoneNumber());
            row.createCell(6).setCellValue(orders.get(i).getUser().getEmail());
            row.createCell(7).setCellValue(orders.get(i).getAddress().getCity());
            row.createCell(8).setCellValue(orders.get(i).getAddress().getAddressLine1());
            row.createCell(9).setCellValue(orders.get(i).getAddress().getAddressLine2());
            row.createCell(10).setCellValue(orders.get(i).getAddress().getPostalCode());
            row.createCell(11).setCellValue(orders.get(i).getAddress().getRegion());
            row.createCell(12).setCellValue(orders.get(i).getShippingMethod() == null ? "" : orders.get(i).getShippingMethod().getName());
            Cell cell = row.createCell(13);
            ShopOrderStatus status = orders.get(i).getStatus().get(orders.get(i).getStatus().size() - 1);
            cell.setCellStyle(getOrderStatusStyle(xssfWorkbook, status.getStatus()));
            cell.setCellValue(status.getStatus());
            try {
                row.createCell(14).setCellValue(orders.get(i).getPayment().getType().getName());
            } catch (NullPointerException e) {

            }
            for (int z = 0; z < orders.get(i).getOrderLines().size(); z++) {
                OrderLine orderLine = orders.get(i).getOrderLines().get(z);
                if(z==0){
                    row.createCell(15).setCellValue(orderLine.getId());
                    row.createCell(16).setCellValue(orderLine.getProductItem().getProduct().getName());
                    row.createCell(17).setCellValue(String.join(",", orderLine.getProductItem().getOptions().stream().map(VariationOption::getValue).toList()));
                    row.createCell(18).setCellValue(orderLine.getQty());
                    row.createCell(19).setCellValue(orderLine.getTotal().doubleValue());
                    row.createCell(20).setCellFormula("SUM(T"+startOrder+":T"+endOrder+")");
                }else {
                    Row item = sheet.createRow(startOrder + z);
                    item.createCell(15).setCellValue(orderLine.getId());
                    item.createCell(16).setCellValue(orderLine.getProductItem().getProduct().getName());
                    item.createCell(17).setCellValue(String.join(",", orderLine.getProductItem().getOptions().stream().map(VariationOption::getValue).toList()));
                    item.createCell(18).setCellValue(orderLine.getQty());
                    item.createCell(19).setCellValue(orderLine.getTotal().doubleValue());
                    item.createCell(20).setCellFormula("SUM(T"+(startOrder-1)+":T"+(endOrder-1)+")");
                }



            }
            if (endOrder - startOrder > 0) {
                for (int j = 0; j < 15; j++) {
                    sheet.addMergedRegion(new CellRangeAddress(startOrder, endOrder, j, j));
                }
            }
            startOrder = endOrder + 1;
        }
        return xssfWorkbook;


    }

    public static XSSFCellStyle getOrderStatusStyle(XSSFWorkbook workbook, Integer status) {
        XSSFCellStyle style = workbook.createCellStyle();
        if (status == OrderStatus.PAID.id) {
            style.setFillForegroundColor(IndexedColors.WHITE.index);
            style.setFillBackgroundColor(IndexedColors.WHITE.index);
        } else if (status == OrderStatus.PENDING_PAYMENT.id) {
            style.setFillForegroundColor(IndexedColors.CORAL.index);
            style.setFillBackgroundColor(IndexedColors.CORAL.index);
        } else if (status == OrderStatus.CONFIRMED.id) {
            style.setFillForegroundColor(IndexedColors.LIGHT_BLUE.index);
            style.setFillBackgroundColor(IndexedColors.LIGHT_BLUE.index);
        } else if (status == OrderStatus.PREPARING.id) {
            style.setFillForegroundColor(IndexedColors.YELLOW.index);
            style.setFillBackgroundColor(IndexedColors.YELLOW.index);
        } else if (status == OrderStatus.SHIPPING.id) {
            style.setFillForegroundColor(IndexedColors.BLUE.index);
            style.setFillBackgroundColor(IndexedColors.BLUE.index);
        } else if (status == OrderStatus.DELIVERED.id) {
            style.setFillForegroundColor(IndexedColors.OLIVE_GREEN.index);
            style.setFillBackgroundColor(IndexedColors.OLIVE_GREEN.index);
        } else if (status == OrderStatus.COMPLETED.id) {
            style.setFillForegroundColor(IndexedColors.GREEN.index);
            style.setFillBackgroundColor(IndexedColors.GREEN.index);
        } else if (status == OrderStatus.CANCELLED.id) {
            style.setFillForegroundColor(IndexedColors.ROSE.index);
            style.setFillBackgroundColor(IndexedColors.ROSE.index);
        } else if (status == OrderStatus.RETURNED.id) {
            style.setFillForegroundColor(IndexedColors.RED.index);
            style.setFillBackgroundColor(IndexedColors.RED.index);
        }
        return style;
    }
}
