package com.smartseg.backend.repository;

import com.smartseg.backend.model.Administrator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdministratorRepository extends JpaRepository<Administrator, Long> {
    boolean existsByEmail(String email);
    Optional<Administrator> findByEmail(String email);
}
