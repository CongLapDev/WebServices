package com.nhs.individual.specification.ISpecification;

import com.nhs.individual.constant.OrderStatus;
import com.nhs.individual.domain.*;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.sql.Timestamp;

public interface IShopOrderSpecification extends GeneralSpecification<ShopOrder>{
    static Specification<ShopOrder> fromToDate(Timestamp from, Timestamp to){
        return (shopOrder,cp,cq)->cq.between(shopOrder.get(ShopOrder_.ORDER_DATE),from,to);
    }


    static Specification<ShopOrder> byStatus(OrderStatus status){
        return (shopOrder,cq,cb)->{
            Subquery<Integer> orderStatusSubquery=cb.createQuery().subquery(Integer.class);
            Root<ShopOrderStatus> orderStatusRoot=orderStatusSubquery.from(ShopOrderStatus.class);
            orderStatusSubquery.select(cb.max(orderStatusRoot.get(ShopOrderStatus_.id)))
                    .where(cb.equal(orderStatusRoot.get(ShopOrderStatus_.SHOP_ORDER_ID),shopOrder.get(ShopOrder_.ID)));

            Subquery<Integer> orderStatusSubquery1=cq.subquery(Integer.class);
            Root<ShopOrderStatus> orderStatusRoot1=orderStatusSubquery1.from(ShopOrderStatus.class);
            orderStatusSubquery1
                    .select(orderStatusRoot1.get(ShopOrderStatus_.ID))
                    .where(cb.equal(orderStatusRoot1.get(ShopOrderStatus_.STATUS),status.id),
                            orderStatusRoot1.get(ShopOrderStatus_.ID).in(orderStatusSubquery));
            return cb.exists(orderStatusSubquery1);
        };
    }
    static Specification<ShopOrder> byUser(Integer userId){
        return (shopOrder,cp,cb)->cb.equal(shopOrder.get(ShopOrder_.USER_ID),userId);
    }
    static Specification<ShopOrder> byAddress(String address){
        return (root,cq,cb)->{
            Join<ShopOrder, Address> orderAddressJoin=root.join(ShopOrder_.ADDRESS);
            return cb.or(cb.like(orderAddressJoin.get(Address_.ADDRESS_LINE1),"%"+address+"%"),
                    cb.like(orderAddressJoin.get(Address_.ADDRESS_LINE2),"%"+address+"%"),
                    cb.like(orderAddressJoin.get(Address_.BUILDING),"%"+address+"%"),
                    cb.like(orderAddressJoin.get(Address_.CITY),"%"+address+"%"),
                    cb.like(orderAddressJoin.get(Address_.POSTAL_CODE),"%"+address+"%"));
        };
    }
}
