package com.smartseg.backend.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Data;

import java.time.LocalDate;

@Data
@JsonPropertyOrder({"scanId", "scannerModel", "fieldStrength",
        "sliceThickness", "contrastAgent",
        "acquisitionDate", "notes"})
public class AcquisitionParametersResponse {
    private Long scanId;
    private String scannerModel;
    private Double fieldStrength;
    private Double sliceThickness;
    private String contrastAgent;
    private LocalDate acquisitionDate;
    private String notes;

}
