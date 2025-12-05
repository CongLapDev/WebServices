package com.nhs.individual.specification.ISpecification;

import com.nhs.individual.constant.AccountProvider;
import com.nhs.individual.constant.AccountRole;
import com.nhs.individual.constant.AccountStatus;
import com.nhs.individual.domain.*;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;


public interface IUserSpecification extends GeneralSpecification<User> {
    static Specification<User> byRole(AccountRole role){
        return (root,cq,cb)->{
            Join<User, Account> userAccountJoin=root.join(User_.ACCOUNT);
            Join<Account, Role> accountRoleJoin=userAccountJoin.join(Account_.ROLES);
            return cb.equal(accountRoleJoin.get(Role_.NAME),role.role);
        };
    }

    static Specification<User> byAddress(String address){
        return (root,cq,cb)->{
            Join<User,UserAddress> userAddressJoin=root.join(User_.ACCOUNT);
            Join<UserAddress,Address> addressUser=userAddressJoin.join(UserAddress_.ADDRESS);
            Predicate cityPredicate=cb.like(addressUser.get(Address_.CITY),"%"+address+"%");
            Predicate buildingPredicate=cb.like(addressUser.get(Address_.BUILDING),"%"+address+"%");
            Predicate line1Predicate=cb.like(addressUser.get(Address_.ADDRESS_LINE1),"%"+address+"%");
            Predicate line2Predicate=cb.like(addressUser.get(Address_.ADDRESS_LINE1),"%"+address+"%");
            return cb.or(cityPredicate,buildingPredicate,line2Predicate,line1Predicate);
        };
    }
    static Specification<User> byName(String name){
        return (root,cq,cb)->{
            String[] extract=name.split("[|./_]");
            Predicate[] predicates = new Predicate[extract.length+1];
            for(int i=0;i<extract.length;i++){
                predicates[i]=cb.like(cb.concat(root.get(User_.FIRSTNAME),root.get(User_.LASTNAME)),"%"+extract[i]+"%");
            }
            predicates[extract.length]=cb.like(cb.concat(root.get(User_.FIRSTNAME),root.get(User_.LASTNAME)),"%"+name+"%");
            return cb.or(predicates);
        };
    }
    static Specification<User> byProvider(AccountProvider provider){
        return (root,cq,cb)->{
            Join<User,Account> userAccountJoin=root.join(User_.ACCOUNT);
            return cb.equal(userAccountJoin.get(Account_.PROVIDER),provider);
        };
    }
    static Specification<User> byStatus(AccountStatus accountStatus){
        return (root, cq, cb) -> {
            Join<User, Account> userAccountJoin=root.join(User_.ACCOUNT);
            return cb.equal(userAccountJoin.get(Account_.STATUS),accountStatus);
        };
    }

}
