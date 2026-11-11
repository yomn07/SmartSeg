package com.smartseg.backend.service;

import com.smartseg.backend.dto.PatientResponse;
import com.smartseg.backend.exception.ResourceNotFoundException;
import com.smartseg.backend.model.Patient;
import com.smartseg.backend.model.User;
import com.smartseg.backend.repository.PatientRepository;
import com.smartseg.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatientService {
    @Autowired
    private PatientRepository patientRepository;

    // Create patient
    public Patient createPatient(Patient patient) {
        return patientRepository.save(patient);
    }

    // Get all patients
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    // Get patient by id
    public Patient getPatientById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
    }

    // Delete patient
    public void deletePatient(Long id) {
        patientRepository.deleteById(id);
    }
    public PatientResponse toResponse(Patient patient) {
        PatientResponse response = new PatientResponse();
        response.setId(patient.getId());
        response.setName(patient.getName());
        response.setAge(patient.getAge());
        response.setTotalScans(patient.getMriScans() != null ?
                patient.getMriScans().size() : 0);
        return response;
    }
}
