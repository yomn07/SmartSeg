package com.smartseg.backend.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@JsonPropertyOrder({"id", "scanId", "patientName",
        "resultPath", "segmentationDate",
        "dscWT", "dscTC", "dscET",
        "iouWT", "iouTC", "iouET",
        "accuracy", "validated", "validatedBy"})
public class SegmentationResultResponse {
    private Long id;
    private Long scanId;
    private String patientName;
    private String resultPath;
    private LocalDateTime segmentationDate;

    // Metrics
    private float dscWT;
    private float dscTC;
    private float dscET;
    private float iouWT;
    private float iouTC;
    private float iouET;
    private float accuracy;

    // Validation
    private boolean validated;
    private String validatedBy;
}
