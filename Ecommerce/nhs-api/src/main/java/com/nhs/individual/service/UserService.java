package com.nhs.individual.service;

import com.nhs.individual.constant.AccountProvider;
import com.nhs.individual.constant.AccountRole;
import com.nhs.individual.domain.User;
import com.nhs.individual.repository.UserRepository;
import com.nhs.individual.specification.DynamicSearch;
import com.nhs.individual.specification.ISpecification.IUserSpecification;
import com.nhs.individual.specification.UserSpecification;
import com.nhs.individual.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;


@Service
public class UserService {
    @Autowired
    UserRepository userRepository;
    @Autowired
    AddressService service;

    public Optional<User> findById(int id){
        return userRepository.findById(id);
    }
    public User save(User user){
        return userRepository.save(user);
    }

    public User update(User user){
        userRepository.findAllByEmailOrPhoneNumber(user.getId(),user.getPhoneNumber(),user.getEmail())
                 .ifPresent((user_)->{
                     throw new IllegalArgumentException("Phone or email is existed");});
        return userRepository.findById(user.getId()).map(oldUser-> userRepository.save(ObjectUtils.merge(oldUser,user,User.class)))
                .orElseThrow(()-> new IllegalArgumentException("Invalid UserId"));
    }
    public void deleteById(Integer id){
        userRepository.deleteById(id);
    }
    public User findByAccountId(Integer accountId){
        return userRepository.findByAccount_id(accountId);
    }
    public List<User> findAll(int page,int size){
        return userRepository.findAll(PageRequest.of(page, size)).getContent();
    }
    public List<User> findAll(List<UserSpecification> specifications, PageRequest pageRequest){
        Specification<User> user=null;
        if(!specifications.isEmpty()){
            user=Specification.where(specifications.get(0));
            for(int i=1;i<specifications.size();i++){
                user.or(specifications.get(i));
            }
        }
        return userRepository.findAll(user,pageRequest).getContent();
    }


    public Page<User> findAll(Integer page, Integer size, String name, String address, AccountRole role, AccountProvider provider, Map<String, String> propertiesMap) throws IllegalArgumentException{
        List<Specification<User>> specifications=new ArrayList<Specification<User>>();
        if(name!=null) specifications.add(IUserSpecification.byName(name));
        if(address!=null) specifications.add(IUserSpecification.byAddress(address));
        if(role!=null) specifications.add(IUserSpecification.byRole(role));
        if(provider!=null) specifications.add(IUserSpecification.byProvider(provider));
        propertiesMap.forEach((key,value)->{
            String[] operationValue=value.split("[()]");
            if(operationValue.length==2) specifications.add(new UserSpecification(new DynamicSearch(key,operationValue[1],DynamicSearch.Operator.valueOf(operationValue[0]))));
            else throw new IllegalArgumentException("Invalid operation. Input Operation must be format in operator(value) ");
        });
        if(specifications.size()>0){
            Specification<User> specification=specifications.get(0);
            for(int i=1;i<specifications.size();i++){
                specification=specification.or(specifications.get(i));
            }
            return userRepository.findAll(specification,PageRequest.of(page,size));
        }
        return userRepository.findAll(PageRequest.of(page,size));
    }
    public Optional<User> findAllByEmailOrPhoneNumber(String email,String phoneNumber){
        return userRepository.findAllByEmailOrPhoneNumber(email,phoneNumber);
    }
}
