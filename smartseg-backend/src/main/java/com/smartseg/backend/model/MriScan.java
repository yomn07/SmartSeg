package com.smartseg.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "mri_scans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MriScan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 4 BraTS2020 modalities
    private String t1Path;      // T1
    private String t2Path;      // T2
    private String flairPath;   // FLAIR
    private String t1cePath;// T1 with Gadolinium contrast (T1GD/T1CE)

    // MRI Acquisition Parameters (recorded by MRI Technician)
    private String scannerModel;      // e.g. "Siemens Magnetom"
    private Double fieldStrength;     // e.g. 1.5, 3.0, 7.0 (Tesla)
    private Double sliceThickness;    // e.g. 1.0, 1.5 (mm)
    private String contrastAgent;     // e.g. "Gadolinium" or "None"
    private LocalDate acquisitionDate; // when scan was taken
    private String notes;             // any additional technician notes
    @Column(updatable = false)
    private LocalDateTime uploadDate;
    @PrePersist
    protected void onCreate() {
        uploadDate = LocalDateTime.now();
    }
    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "uploaded_by_id")
    private User uploadedBy;

    @OneToOne(mappedBy = "mriScan", cascade = CascadeType.ALL)
    private SegmentationResult segmentationResult;
    @ManyToOne
    @JoinColumn(name = "assigned_doctor_id")
    private Doctor assignedDoctor;
}
