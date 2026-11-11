package com.smartseg.backend.controller;

import com.smartseg.backend.dto.AcquisitionParametersRequest;
import com.smartseg.backend.dto.AcquisitionParametersResponse;
import com.smartseg.backend.dto.MriScanResponse;
import com.smartseg.backend.service.ScanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/technician")
//@CrossOrigin(origins = "http://localhost:3000")
@PreAuthorize("hasRole('TECHNICIAN')")
public class TechnicianController {

    @Autowired
    private ScanService scanService;
    // Record acquisition parameters for a scan
    @PostMapping("/scan/{id}/parameters")
    public ResponseEntity<AcquisitionParametersResponse> recordParameters(
            @PathVariable Long id,
            @RequestBody AcquisitionParametersRequest request,
            Authentication authentication) {

        String technicianEmail = authentication.getName();
        return ResponseEntity.ok(
                scanService.recordParameters(id, technicianEmail, request));
    }
    // Update acquisition parameters
    @PutMapping("/scan/{id}/parameters")
    public ResponseEntity<AcquisitionParametersResponse> updateParameters(
            @PathVariable Long id,
            @RequestBody AcquisitionParametersRequest request,
            Authentication authentication) {

        String technicianEmail = authentication.getName();
        return ResponseEntity.ok(
                scanService.recordParameters(id, technicianEmail, request));
    }
    // Get acquisition parameters of a scan
    @GetMapping("/scan/{id}/parameters")
    public ResponseEntity<AcquisitionParametersResponse> getParameters(
            @PathVariable Long id) {
        return ResponseEntity.ok(scanService.getParameters(id));
    }

}