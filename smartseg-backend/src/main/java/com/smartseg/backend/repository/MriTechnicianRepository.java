package com.smartseg.backend.repository;

import com.smartseg.backend.model.MriTechnician;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MriTechnicianRepository extends JpaRepository<MriTechnician, Long> {
    Optional<MriTechnician> findByEmail(String email);
}
