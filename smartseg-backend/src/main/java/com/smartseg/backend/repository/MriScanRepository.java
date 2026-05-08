package com.smartseg.backend.repository;

import com.smartseg.backend.model.Doctor;
import com.smartseg.backend.model.MriScan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MriScanRepository extends JpaRepository<MriScan, Long> {
    List<MriScan> findByPatientId(Long patientId);
    List<MriScan> findByUploadedById(Long technicianId);
    List<MriScan> findByAssignedDoctor(Doctor doctor);
}