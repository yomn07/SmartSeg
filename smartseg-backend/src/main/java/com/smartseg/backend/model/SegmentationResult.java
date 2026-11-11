package com.smartseg.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "segmentation_results")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SegmentationResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String resultPath;
    private float accuracy;
    private boolean validated;
    // BraTS metrics per tumor region (from your report)
    private float dscWT;   // Whole Tumor DSC
    private float dscTC;   // Tumor Core DSC
    private float dscET;   // Enhancing Tumor DSC
    private float iouWT;   // Whole Tumor IoU
    private float iouTC;   // Tumor Core IoU
    private float iouET;   // Enhancing Tumor IoU

    private LocalDateTime segmentationDate;
    @PrePersist
    protected void onCreate() {
        segmentationDate = LocalDateTime.now();
    }
    @OneToOne
    @JoinColumn(name = "scan_id")
    private MriScan mriScan;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor validatedBy;
}
