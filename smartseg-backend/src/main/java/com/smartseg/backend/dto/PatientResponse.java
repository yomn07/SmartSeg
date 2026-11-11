package com.smartseg.backend.dto;

import lombok.Data;

@Data
public class PatientResponse {
    private Long id;
    private String name;
    private int age;
    private int totalScans;
}
