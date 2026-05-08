package com.smartseg.backend.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class MriScanResponse {
    private Long id;
    private String t1Path;
    private String t2Path;
    private String flairPath;
    private String t1cePath;
    private LocalDateTime uploadDate;

    // Patient info (flat - no nesting)
    private Long patientId;
    private String patientName;
    private int patientAge;

    // Uploader info (flat - no nesting)
    private Long uploadedById;
    private String uploadedByName;
    private String uploadedByRole;
    // assigned Doctor info (id and name)
    private Long assignedDoctorId;
    private String assignedDoctorName;
    // Add these fields to MriScanResponse
    private String scannerModel;
    private Double fieldStrength;
    private Double sliceThickness;
    private String contrastAgent;
    private LocalDate acquisitionDate;
    private String notes;
}
