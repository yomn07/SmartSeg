package com.smartseg.backend.repository;

import com.smartseg.backend.model.SegmentationResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SegmentationResultRepository extends JpaRepository<SegmentationResult, Long> {
    Optional<SegmentationResult> findByMriScanId(Long scanId);
    List<SegmentationResult> findByValidatedBy_Id(Long doctorId);
    List<SegmentationResult> findByValidated(boolean validated);
}