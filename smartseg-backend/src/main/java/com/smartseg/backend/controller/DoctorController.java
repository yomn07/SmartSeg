package com.smartseg.backend.controller;

import com.smartseg.backend.dto.SegmentationResultResponse;
import com.smartseg.backend.service.SegmentationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctor")
//@CrossOrigin(origins = "http://localhost:3000")
@PreAuthorize("hasRole('DOCTOR')")
public class DoctorController {
    @Autowired
    private SegmentationService segmentationService;

    // Trigger segmentation for a scan
    @PostMapping("/scan/{scanId}/segment")
    public ResponseEntity<?> runSegmentation(
            @PathVariable Long scanId,
            Authentication authentication) {
        try {
            String doctorEmail = authentication.getName();
            SegmentationResultResponse result =
                    segmentationService.runSegmentation(scanId, doctorEmail);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    // Get segmentation result for a scan
    @GetMapping("/scan/{scanId}/result")
    public ResponseEntity<?> getResult(
            @PathVariable Long scanId,
            Authentication authentication) {
        try {
            String doctorEmail = authentication.getName();
            return ResponseEntity.ok(
                    segmentationService.getResultByScanId(scanId, doctorEmail));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    // Get all results for this doctor
    @GetMapping("/results")
    public ResponseEntity<List<SegmentationResultResponse>> getAllResults(
            Authentication authentication) {
        String doctorEmail = authentication.getName();
        return ResponseEntity.ok(
                segmentationService.getResultsForDoctor(doctorEmail));
    }
    // Validate result ✅
    @PutMapping("/results/{resultId}/validate")
    public ResponseEntity<?> validateResult(
            @PathVariable Long resultId,
            Authentication authentication) {
        try {
            String doctorEmail = authentication.getName();
            return ResponseEntity.ok(
                    segmentationService.validateResult(resultId, doctorEmail));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    // Invalidate result →
    @PutMapping("/results/{resultId}/invalidate")
    public ResponseEntity<?> invalidateResult(
            @PathVariable Long resultId,
            Authentication authentication) {
        try {
            String doctorEmail = authentication.getName();
            return ResponseEntity.ok(
                    segmentationService.invalidateResult(resultId, doctorEmail));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                    .body(Map.of("error", e.getMessage()));
        }
    }

}
