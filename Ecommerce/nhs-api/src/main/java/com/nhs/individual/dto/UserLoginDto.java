package com.nhs.individual.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.nhs.individual.domain.Account;
import com.nhs.individual.domain.User;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.sql.Date;

/**
 * DTO for User returned during login
 * Only includes essential fields to avoid triggering unnecessary database queries
 * Prevents SQL permission errors on tables like 'comment' that aren't needed for authentication
 */
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserLoginDto {
    private Integer id;
    private String firstname;
    private String lastname;
    private Date dateOfBirth;
    private String gender;
    private String phoneNumber;
    private String email;
    private String picture;
    private AccountDto account;

    public UserLoginDto(User user) {
        if (user == null) return;
        
        this.id = user.getId();
        this.firstname = user.getFirstname();
        this.lastname = user.getLastname();
        this.dateOfBirth = user.getDateOfBirth();
        this.gender = user.getGender();
        this.phoneNumber = user.getPhoneNumber();
        this.email = user.getEmail();
        this.picture = user.getPicture();
        
        // Only include account with roles - don't trigger lazy loading of other relationships
        Account account = user.getAccount();
        if (account != null) {
            this.account = new AccountDto(account);
        }
    }
}

