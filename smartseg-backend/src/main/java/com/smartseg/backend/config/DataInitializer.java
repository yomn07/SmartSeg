package com.smartseg.backend.config;

import com.smartseg.backend.model.Administrator;
import com.smartseg.backend.model.Doctor;
import com.smartseg.backend.model.MriTechnician;
import com.smartseg.backend.repository.AdministratorRepository;
import com.smartseg.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    @Autowired
    private AdministratorRepository administratorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        // Create Admin if not exists
        if (administratorRepository.count() == 0) {
            Administrator admin = new Administrator();
            admin.setName("Admin");
            admin.setEmail("admin@smartseg.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            administratorRepository.save(admin);
            System.out.println("✅ Admin created!");
        }

        // Create Doctor if not exists
        if (userRepository.count() == 0) {
            Doctor doctor = new Doctor();
            doctor.setName("Dr. Smith");
            doctor.setEmail("doctor@smartseg.com");
            doctor.setEnabled(true);
            doctor.setPassword(passwordEncoder.encode("doctor123"));
            userRepository.save(doctor);
            System.out.println("✅ Doctor created!");

            // Create MRI Technician
            MriTechnician tech = new MriTechnician();
            tech.setName("Tech Sarah");
            tech.setEmail("tech@smartseg.com");

            tech.setEnabled(true);
            tech.setPassword(passwordEncoder.encode("tech123"));
            userRepository.save(tech);
            System.out.println("✅ MRI Technician created!");
        }
    }
}
