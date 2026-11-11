package com.smartseg.backend.service;
import com.smartseg.backend.dto.AcquisitionParametersRequest;
import com.smartseg.backend.dto.AcquisitionParametersResponse;
import com.smartseg.backend.dto.MriScanResponse;
import com.smartseg.backend.exception.ResourceNotFoundException;
import com.smartseg.backend.model.*;
import com.smartseg.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ScanService {
    @Autowired
    private MriScanRepository mriScanRepository;

    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private UserRepository userRepository;
    // Upload directory
    private static final String UPLOAD_DIR = "C:/Users/DELL/Downloads/smartseg-backend/smartseg-ai/uploads/scans/";

    // Upload MRI scan with 4 modalities
    public MriScan uploadScan(Long patientId,
                              Long doctorId,
                              String uploaderEmail,
                              MultipartFile t1,
                              MultipartFile t2,
                              MultipartFile flair,
                              MultipartFile t1ce) throws IOException {
// Find assigned doctor
        Doctor doctor = (Doctor) userRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));

// Find patient
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

// Find uploader
        User uploader = userRepository.findByEmail(uploaderEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Uploader not found!"));
        // Create upload directory if not exists
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        // Save each modality file
        String t1Path = saveFile(t1, "T1");
        String t2Path = saveFile(t2, "T2");
        String flairPath = saveFile(flair, "FLAIR");
        String t1cePath = saveFile(t1ce, "T1CE");
        // Create and save MriScan
        MriScan scan = new MriScan();
        scan.setPatient(patient);
        scan.setUploadedBy(uploader);
        scan.setAssignedDoctor(doctor);
        scan.setT1Path(t1Path);
        scan.setT2Path(t2Path);
        scan.setFlairPath(flairPath);
        scan.setT1cePath(t1cePath);
        return mriScanRepository.save(scan);
    }
    // Helper method to save a file
    private String saveFile(MultipartFile file, String modality) throws IOException {
        String filename = modality + "_" + UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path path = Paths.get(UPLOAD_DIR + filename);
        Files.write(path, file.getBytes());
        // ✅ Replace backslashes with forward slashes for Flask compatibility
        return path.toString().replace("\\", "/");
    }
    // Get all scans
    public List<MriScan> getAllScans() {
        return mriScanRepository.findAll();
    }
    public List<MriScan> getScansByAssignedDoctor(String doctorEmail) {
        Doctor doctor = (Doctor) userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new RuntimeException("Doctor not found!"));
        return mriScanRepository.findByAssignedDoctor(doctor);
    }
    // Get scans by patient
    public List<MriScan> getScansByPatient(Long patientId) {
        return mriScanRepository.findByPatientId(patientId);
    }

    // Get scans by uploader
    public List<MriScan> getScansByUploader(Long userId) {
        return mriScanRepository.findByUploadedById(userId);
    }
    public MriScan getScanById(Long id, String userEmail) {
        MriScan scan = mriScanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Scan not found!"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        String role = user.getRole();

        // Doctor can only see scans assigned to them
        if (role.equals("DOCTOR")) {
            if (scan.getAssignedDoctor() == null ||
                    !scan.getAssignedDoctor().getId().equals(user.getId())) {
                throw new RuntimeException("Access denied! This scan is not assigned to you.");
            }
        }

        // Technician can only see scans they uploaded
        if (role.equals("TECHNICIAN")) {
            if (scan.getUploadedBy() == null ||
                    !scan.getUploadedBy().getId().equals(user.getId())) {
                throw new RuntimeException("Access denied! You did not upload this scan.");
            }
        }

        return scan;
    }
    // Delete scan
    public void deleteScan(Long id) {
        mriScanRepository.deleteById(id);
    }
    // Convert MriScan to MriScanResponse
    public MriScanResponse toResponse(MriScan scan) {
        MriScanResponse response = new MriScanResponse();
        response.setId(scan.getId());
        response.setT1Path(scan.getT1Path());
        response.setT2Path(scan.getT2Path());
        response.setFlairPath(scan.getFlairPath());
        response.setT1cePath(scan.getT1cePath());
        response.setUploadDate(scan.getUploadDate());

        // Patient info
        if (scan.getPatient() != null) {
            response.setPatientId(scan.getPatient().getId());
            response.setPatientName(scan.getPatient().getName());
            response.setPatientAge(scan.getPatient().getAge());
        }

        // Uploader info
        if (scan.getUploadedBy() != null) {
            response.setUploadedById(scan.getUploadedBy().getId());
            response.setUploadedByName(scan.getUploadedBy().getName());
            response.setUploadedByRole(scan.getUploadedBy().getRole());
        }
        if (scan.getAssignedDoctor() != null) {
            response.setAssignedDoctorId(scan.getAssignedDoctor().getId());
            response.setAssignedDoctorName(scan.getAssignedDoctor().getName());
        }
        // Acquisition parameters
        response.setScannerModel(scan.getScannerModel());
        response.setFieldStrength(scan.getFieldStrength());
        response.setSliceThickness(scan.getSliceThickness());
        response.setContrastAgent(scan.getContrastAgent());
        response.setAcquisitionDate(scan.getAcquisitionDate());
        response.setNotes(scan.getNotes());

        return response;
    }
    // Record acquisition parameters
    public AcquisitionParametersResponse recordParameters(
            Long scanId,
            String technicianEmail,
            AcquisitionParametersRequest request) {

        MriScan scan = mriScanRepository.findById(scanId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Scan not found with id: " + scanId));

        // Verify technician uploaded this scan
        User technician = userRepository.findByEmail(technicianEmail)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Technician not found!"));

        if (!scan.getUploadedBy().getId().equals(technician.getId())) {
            throw new RuntimeException(
                    "Access denied! You did not upload this scan.");
        }

        // Update parameters
        if (request.getScannerModel() != null)
            scan.setScannerModel(request.getScannerModel());
        if (request.getFieldStrength() != null)
            scan.setFieldStrength(request.getFieldStrength());
        if (request.getSliceThickness() != null)
            scan.setSliceThickness(request.getSliceThickness());
        if (request.getContrastAgent() != null)
            scan.setContrastAgent(request.getContrastAgent());
        if (request.getAcquisitionDate() != null)
            scan.setAcquisitionDate(request.getAcquisitionDate());
        if (request.getNotes() != null)
            scan.setNotes(request.getNotes());

        mriScanRepository.save(scan);

        return toParametersResponse(scan);
    }

    // Get acquisition parameters
    public AcquisitionParametersResponse getParameters(Long scanId) {
        MriScan scan = mriScanRepository.findById(scanId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Scan not found with id: " + scanId));
        return toParametersResponse(scan);
    }

    // Convert to parameters response
    private AcquisitionParametersResponse toParametersResponse(MriScan scan) {
        AcquisitionParametersResponse response =
                new AcquisitionParametersResponse();
        response.setScanId(scan.getId());
        response.setScannerModel(scan.getScannerModel());
        response.setFieldStrength(scan.getFieldStrength());
        response.setSliceThickness(scan.getSliceThickness());
        response.setContrastAgent(scan.getContrastAgent());
        response.setAcquisitionDate(scan.getAcquisitionDate());
        response.setNotes(scan.getNotes());
        return response;
    }
}