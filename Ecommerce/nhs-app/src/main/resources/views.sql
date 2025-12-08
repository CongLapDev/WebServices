create or replace view AccountStatisticsView as
SELECT COUNT(*)                                    AS total_accounts,
       SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS total_status_1,
       SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) AS total_status_2,
       SUM(CASE WHEN status = 3 THEN 1 ELSE 0 END) AS total_status_3
FROM account;


create or replace view MostOrderedPdView as
select *
from product
         join(select sum(total.total) as total, product_id
              from product_item
                       join (select count(*) as total, order_line.product_item_id
                             from order_line
                                      join shop_order on order_line.order_id = shop_order.id
                             group by order_line.product_item_id
                             order by count(*) DESC) as total
                            on total.product_item_id = product_item.id
              group by product_item.product_id) as product_total
             on product.id = product_total.product_id;
--             View này tạo bảng ảo để lấy các sản phẩm được đặt hàng nhiều nhất.

create or replace view prospectiveUser as
select *
from user
         join(select sum(shop_order.total) as total_amount, count(*) as total_order, user_id
              from shop_order
              group by user_id
              order by total_amount desc) user_order_total
             on user.id = user_order_total.user_id;

--           View này dùng để xác định khách hàng tiềm năng dựa trên tổng tiền đã mua và số đơn hàng.