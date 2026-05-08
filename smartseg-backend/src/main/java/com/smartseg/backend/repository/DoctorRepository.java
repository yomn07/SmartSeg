package com.smartseg.backend.repository;

import com.smartseg.backend.model.Doctor;
import com.smartseg.backend.model.MriScan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface DoctorRepository  extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByEmail(String email);

}
