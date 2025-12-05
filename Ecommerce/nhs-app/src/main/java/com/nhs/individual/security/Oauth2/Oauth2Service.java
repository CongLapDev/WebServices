package com.nhs.individual.security.Oauth2;

import com.nhs.individual.constant.AccountProvider;
import com.nhs.individual.constant.AccountRole;
import com.nhs.individual.domain.Account;
import com.nhs.individual.domain.Role;
import com.nhs.individual.domain.User;
import com.nhs.individual.secure.IUserDetail;
import com.nhs.individual.service.AccountService;
import com.nhs.individual.service.AuthService;
import com.nhs.individual.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
@Component
public class Oauth2Service extends DefaultOAuth2UserService {
    @Autowired
    AccountService accountService;
    @Autowired
    UserService userService;
    @Autowired
    AuthService authService;
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        IUserDetail oAuth2User=new IUserDetail(super.loadUser(userRequest));
        Account account_=accountService.findByUsername(oAuth2User.getName())
                .orElseGet(()-> userService.findAllByEmailOrPhoneNumber(oAuth2User.getAttributes().get("email").toString(),null)
                .map(User::getAccount)
                .orElseGet(()->{
                   //Setup new account
                    Account account=new Account();
                    account.setUsername(oAuth2User.getName());
                    account.setPassword(UUID.randomUUID().toString());
                    account.setProvider(AccountProvider.GOOGLE);
                    Role role=new Role();
                    role.setId(AccountRole.USER.id);
                    account.setRoles(List.of(role));
                    //Setup new user
                    User user=new User();
                    user.setEmail((String) oAuth2User.getAttributes().get("email"));
                    user.setFirstname((String) oAuth2User.getAttributes().get("given_name"));
                    user.setLastname((String) oAuth2User.getAttributes().get("family_name"));
                    user.setPicture((String) oAuth2User.getAttributes().get("picture"));
                    account.setUser(user);
                    user.setAccount(account);
                    return authService.register(account);
               }));
        account_.setRefreshToken(null);
        return new IUserDetail(account_);
    }


}
