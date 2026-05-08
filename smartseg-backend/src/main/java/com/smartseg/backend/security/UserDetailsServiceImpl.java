package com.smartseg.backend.security;

import com.smartseg.backend.model.Administrator;
import com.smartseg.backend.model.User;
import com.smartseg.backend.repository.AdministratorRepository;
import com.smartseg.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdministratorRepository administratorRepository;

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {
        // Check in users table (Doctor + MRITechnician)
        if (userRepository.existsByEmail(email)) {
            User user = userRepository.findByEmail(email).get();
            if (!user.isEnabled()) {
                throw new DisabledException("Account not approved yet!");
            }
            return new org.springframework.security.core.userdetails.User(
                    user.getEmail(),
                    user.getPassword(),
                    List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
            );
        }

        // Check in administrators table
        if (administratorRepository.existsByEmail(email)) {
            Administrator admin = administratorRepository.findByEmail(email).get();
            return new org.springframework.security.core.userdetails.User(
                    admin.getEmail(),
                    admin.getPassword(),
                    List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
            );
        }

        throw new UsernameNotFoundException("User not found: " + email);
    }
}
