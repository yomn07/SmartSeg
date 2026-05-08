package com.smartseg.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "patients")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private int age;
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    private List<MriScan> mriScans= new ArrayList<>();

}
