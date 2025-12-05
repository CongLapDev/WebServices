package com.nhs.individual.repository.sub_repository;

import com.nhs.individual.views.Prospectiveuser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProspectiveUserRepository extends JpaRepository<Prospectiveuser,Integer> {
}
