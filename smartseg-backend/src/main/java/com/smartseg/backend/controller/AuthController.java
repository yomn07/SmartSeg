package com.smartseg.backend.controller;
import com.smartseg.backend.dto.JwtResponse;
import com.smartseg.backend.dto.LoginRequest;
import com.smartseg.backend.dto.RegisterRequest;
import com.smartseg.backend.model.Doctor;
import com.smartseg.backend.model.MriTechnician;
import com.smartseg.backend.repository.UserRepository;
import com.smartseg.backend.security.JwtUtil;
import com.smartseg.backend.security.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
//@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try{
        // 1. Authenticate email + password
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // 2. Load user details
        UserDetails userDetails = userDetailsService
                .loadUserByUsername(request.getEmail());

        // 3. Extract role
        String role = userDetails.getAuthorities()
                .iterator().next().getAuthority()
                .replace("ROLE_", "");

        // 4. Generate JWT token
        String token = jwtUtil.generateToken(request.getEmail(), role);


        // 5. Return token + role + email
        return ResponseEntity.ok(new JwtResponse(token, role, request.getEmail()));
    }catch (DisabledException e) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "Account not approved yet! Please wait for admin approval."));

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Invalid email or password!"));
    }}
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists!");
        }

        // Create account based on role
        if (request.getRole().equals("DOCTOR")) {
            Doctor doctor = new Doctor();
            doctor.setName(request.getName());
            doctor.setEmail(request.getEmail());
            doctor.setPassword(passwordEncoder.encode(request.getPassword()));
            doctor.setEnabled(false); // waiting for admin approval
            userRepository.save(doctor);
        } else if (request.getRole().equals("TECHNICIAN")) {
            MriTechnician tech = new MriTechnician();
            tech.setName(request.getName());
            tech.setEmail(request.getEmail());
            tech.setPassword(passwordEncoder.encode(request.getPassword()));
            tech.setEnabled(false); // waiting for admin approval
            userRepository.save(tech);
        } else {
            return ResponseEntity.badRequest().body("Invalid role!");
        }
        return ResponseEntity.ok("Registration successful! Waiting for admin approval.");
    }
}