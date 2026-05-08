package com.smartseg.backend.dto;

import lombok.Data;

import java.time.LocalDate;
@Data
public class AcquisitionParametersRequest {
    private String scannerModel;
    private Double fieldStrength;
    private Double sliceThickness;
    private String contrastAgent;
    private LocalDate acquisitionDate;
    private String notes;
}
