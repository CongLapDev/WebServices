package com.nhs.individual.controller;

import com.nhs.individual.constant.AccountProvider;
import com.nhs.individual.constant.AccountRole;
import com.nhs.individual.domain.User;
import com.nhs.individual.dto.AccountDto;
import com.nhs.individual.exception.ResourceNotFoundException;
import com.nhs.individual.secure.CurrentUser;
import com.nhs.individual.secure.IUserDetail;
import com.nhs.individual.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping(value = "/api/v1/user")
public class UserController {
    @Autowired
    private UserService userService;
    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public User findById(@PathVariable(value = "id") Integer id) {
        return userService.findById(id).map(user->{
            user.setAccount(new AccountDto(user.getAccount()));
            return user;
        }).orElseThrow(()-> new ResourceNotFoundException("User with id " + id + " not found"));
    }
    @RequestMapping(value = "/{id}",method=RequestMethod.DELETE)
    @PreAuthorize("hasAuthority('ADMIN')")
    public void delete(@PathVariable(value = "id") Integer id) {
        userService.deleteById(id);
    }
    @RequestMapping(value = "/{id}",method=RequestMethod.PUT)
    @PreAuthorize("#id==authentication.principal.userId or hasAuthority('ROLE_ADMIN')")
    public User update(@PathVariable(value = "id") Integer id, @RequestBody User user) {
        user.setId(id);
        return userService.update(user);
    }

    @RequestMapping(method = RequestMethod.GET)
    @Secured("ADMIN")
    public Page<User> findAllUser(@CurrentUser IUserDetail userDea, @RequestParam Map<String, String> propertiesMap){
        int page= 0;
        int size=10;
        AccountRole role=null;
        AccountProvider provider=null;
        propertiesMap.remove("size");
        try{
            if(propertiesMap.get("page")!=null) page=Integer.parseInt(propertiesMap.get("page"));
            if(propertiesMap.get("size")!=null) size=Integer.parseInt(propertiesMap.get("size"));
            if(propertiesMap.get("role")!=null) role=AccountRole.valueOf(propertiesMap.get("role"));
            if(propertiesMap.get("provider")!=null) provider=AccountProvider.valueOf(propertiesMap.get("provider"));
        }catch (NumberFormatException ignored){
            throw new IllegalArgumentException("Invalid type argument");
        }finally {
            propertiesMap.remove("page");
            propertiesMap.remove("size");
            propertiesMap.remove("role");
            propertiesMap.remove("provider");
        }
        String name=propertiesMap.get("name");propertiesMap.remove("name");
        String address=propertiesMap.get("address");propertiesMap.remove("address");
        return userService.findAll(page,size,name,address,role,provider,propertiesMap);
    }

}
