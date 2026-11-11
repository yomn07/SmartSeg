package com.smartseg.backend.controller;

import com.smartseg.backend.dto.MriScanResponse;
import com.smartseg.backend.dto.PatientResponse;
import com.smartseg.backend.model.MriScan;
import com.smartseg.backend.model.Patient;
import com.smartseg.backend.model.User;
import com.smartseg.backend.repository.UserRepository;
import com.smartseg.backend.service.PatientService;
import com.smartseg.backend.service.ScanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/shared")
//@CrossOrigin(origins = "http://localhost:3000")
@PreAuthorize("hasAnyRole('DOCTOR', 'TECHNICIAN')")
public class SharedController {
    @Autowired
    private ScanService scanService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PatientService patientService;

    // ─── PATIENT ENDPOINTS ───

    // Create patient
    @PostMapping("/patient")
    public ResponseEntity<PatientResponse> createPatient(@RequestBody Patient patient ) {
        Patient created = patientService.createPatient(patient);
        return ResponseEntity.ok(patientService.toResponse(created));
    }

    // Get all patients   - everyone sees all patients
    @GetMapping("/patients")
    public ResponseEntity<List<PatientResponse>> getAllPatients() {
        return ResponseEntity.ok(patientService.getAllPatients()
                .stream()
                .map(patientService::toResponse)
                .collect(Collectors.toList()));
    }
    // Get patient by id
    @GetMapping("/patients/{id}")
    public ResponseEntity<PatientResponse> getPatientById(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.toResponse(patientService.getPatientById(id)));
    }
    // ─── SCAN ENDPOINTS ──────────────────────────────────

    // Upload MRI scan (4 modalities)
    @PostMapping("/scan/upload")
    public ResponseEntity<MriScanResponse> uploadScan(
            @RequestParam("patientId") Long patientId,
            @RequestParam("doctorId") Long doctorId,
            @RequestParam("t1") MultipartFile t1,
            @RequestParam("t2") MultipartFile t2,
            @RequestParam("flair") MultipartFile flair,
            @RequestParam("t1ce") MultipartFile t1ce,
            Authentication authentication) {
        try {
            String uploaderEmail = authentication.getName();
            MriScan scan = scanService.uploadScan(
                    patientId, doctorId, uploaderEmail,
                    t1, t2, flair, t1ce
            );
            return ResponseEntity.ok(scanService.toResponse(scan));

        } catch (IOException e) {
            return ResponseEntity.status(500).build();

        }
    }
    // Get scans - based on role
    @GetMapping("/scans")
    public ResponseEntity<List<MriScanResponse>> getScans(
            Authentication authentication) {
        String role = authentication.getAuthorities()
                .iterator().next().getAuthority()
                .replace("ROLE_", "");
        String email = authentication.getName();

        List<MriScan> scans;

        if (role.equals("DOCTOR")) {
            // Doctor sees only scans assigned to them
            scans = scanService.getScansByAssignedDoctor(email);
        } else {
            // Technician sees only their own uploads
            User uploader = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found!"));
            scans = scanService.getScansByUploader(uploader.getId());
        }
        return ResponseEntity.ok(scans.stream()
                .map(scanService::toResponse)
                .collect(Collectors.toList()));}


    // Get scan by id - only if assigned
    @GetMapping("/scans/{id}")
    public ResponseEntity<?> getScanById(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            MriScan scan = scanService.getScanById(id, email);
            return ResponseEntity.ok(scanService.toResponse(scan));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", e.getMessage()));
        }}


    // Get scans by patient
    @GetMapping("/scans/patient/{patientId}")
    public ResponseEntity<List<MriScanResponse>> getScansByPatient(
            @PathVariable Long patientId) {
        return ResponseEntity.ok(scanService.getScansByPatient(patientId)
                .stream()
                .map(scanService::toResponse)
                .collect(Collectors.toList()));
    }
}
