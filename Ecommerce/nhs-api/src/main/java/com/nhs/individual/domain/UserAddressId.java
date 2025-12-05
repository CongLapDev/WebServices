package com.nhs.individual.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@Embeddable
@NoArgsConstructor
@AllArgsConstructor
public class UserAddressId implements Serializable {
    @Serial
    private static final long serialVersionUID = 5371036864085763967L;
    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "address_id", nullable = false)
    private Integer addressId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        UserAddressId entity = (UserAddressId) o;
        return Objects.equals(this.userId, entity.userId) &&
                Objects.equals(this.addressId, entity.addressId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, addressId);
    }

}